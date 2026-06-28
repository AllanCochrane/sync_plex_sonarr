import React, { useState } from 'react';
import { Config, PlexEpisode, SonarrSeries, SyncMatch } from '../types';
import { getPlexEpisodes, getPlexLibraries, getSonarrEpisodes, getSonarrSeries, normalizeTitle, unmonitorSonarrEpisodes } from '../lib/api';
import { Play, Loader2, CheckCircle2, AlertCircle, EyeOff } from 'lucide-react';

interface Props {
  config: Config;
}

export function SyncDashboard({ config }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [matches, setMatches] = useState<SyncMatch[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const analyze = async () => {
    try {
      setLoading(true);
      setError('');
      setMatches([]);
      setSynced(false);

      setStatus('Fetching Plex Libraries...');
      const libs = await getPlexLibraries(config);
      
      setStatus('Fetching Plex Episodes...');
      const allPlexEpisodes: PlexEpisode[] = [];
      for (const lib of libs) {
        const episodes = await getPlexEpisodes(config, lib.key);
        allPlexEpisodes.push(...episodes);
      }

      // Group plex episodes by normalized show title
      const plexShowMap = new Map<string, PlexEpisode[]>();
      for (const ep of allPlexEpisodes) {
        const normTitle = normalizeTitle(ep.grandparentTitle);
        if (!plexShowMap.has(normTitle)) {
          plexShowMap.set(normTitle, []);
        }
        plexShowMap.get(normTitle)!.push(ep);
      }

      setStatus('Fetching Sonarr Series...');
      const sonarrSeries = await getSonarrSeries(config);

      const newMatches: SyncMatch[] = [];

      for (let i = 0; i < sonarrSeries.length; i++) {
        const series = sonarrSeries[i];
        setStatus(`Analyzing series ${i + 1} of ${sonarrSeries.length}: ${series.title}`);
        
        const normTitle = normalizeTitle(series.title);
        const normClean = normalizeTitle(series.cleanTitle);
        
        let plexEps = plexShowMap.get(normTitle) || plexShowMap.get(normClean);
        
        if (plexEps) {
          const sonarrEps = await getSonarrEpisodes(config, series.id);
          
          const matchedEps = sonarrEps.filter(se => {
            // We only care if it's monitored and sonarr doesn't have the file
            if (!se.monitored || se.hasFile) return false;
            
            // Check if Plex has this episode
            return plexEps.some(pe => pe.parentIndex === se.seasonNumber && pe.index === se.episodeNumber);
          });

          if (matchedEps.length > 0) {
            newMatches.push({ series, episodes: matchedEps });
          }
        }
      }

      setMatches(newMatches);
      setStatus('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const sync = async () => {
    try {
      setSyncing(true);
      setError('');
      
      const allEpisodeIds = matches.flatMap(m => m.episodes.map(e => e.id));
      
      if (allEpisodeIds.length === 0) return;

      setStatus(`Unmonitoring ${allEpisodeIds.length} episodes in Sonarr...`);
      
      // Sonarr API accepts multiple IDs
      await unmonitorSonarrEpisodes(config, allEpisodeIds);
      
      setSynced(true);
      setStatus('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during sync.');
      setStatus('');
    } finally {
      setSyncing(false);
    }
  };

  const totalEpisodesToUnmonitor = matches.reduce((acc, m) => acc + m.episodes.length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-medium text-white">Sync Status</h2>
          <p className="text-slate-400 text-sm mt-1">
            Analyze your libraries to find episodes present in Plex but still monitored in Sonarr.
          </p>
        </div>
        <button
          onClick={analyze}
          disabled={loading || syncing}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium py-2 px-6 rounded-xl transition-colors whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {status && (
        <div className="text-indigo-400 text-sm flex items-center gap-2 justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          {status}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && matches.length > 0 && !synced && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h3 className="text-lg font-medium text-white">Action Required</h3>
              <p className="text-sm text-slate-400 mt-1">
                Found {totalEpisodesToUnmonitor} episodes across {matches.length} series that are in Plex but monitored in Sonarr.
              </p>
            </div>
            <button
              onClick={sync}
              disabled={syncing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium py-2 px-6 rounded-xl transition-colors"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
              {syncing ? 'Syncing...' : 'Unmonitor All in Sonarr'}
            </button>
          </div>
          
          <ul className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {matches.map(match => (
              <li key={match.series.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-white">{match.series.title}</span>
                  <span className="text-xs bg-white/10 text-slate-300 px-2 py-1 rounded-full">
                    {match.episodes.length} episodes
                  </span>
                </div>
                <div className="text-sm text-slate-400 flex flex-wrap gap-2">
                  {match.episodes.map(e => (
                    <span key={e.id} className="bg-white/10 px-1.5 py-0.5 rounded text-xs border border-white/5 text-slate-300">
                      S{e.seasonNumber.toString().padStart(2, '0')}E{e.episodeNumber.toString().padStart(2, '0')}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && matches.length === 0 && status === '' && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">All Good!</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            We couldn't find any monitored episodes in Sonarr that you already have in Plex.
          </p>
        </div>
      )}

      {synced && (
        <div className="backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-emerald-400 mb-2">Sync Complete</h3>
          <p className="text-emerald-200/70 max-w-md mx-auto">
            Successfully unmonitored {totalEpisodesToUnmonitor} episodes in Sonarr to prevent future downloads.
          </p>
        </div>
      )}

    </div>
  );
}
