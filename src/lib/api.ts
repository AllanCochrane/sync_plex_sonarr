import { Config, PlexEpisode, PlexLibrary, SonarrEpisode, SonarrSeries } from '../types';

function cleanUrl(url: string) {
  return url.replace(/\/+$/, '');
}

export async function getPlexLibraries(config: Config): Promise<PlexLibrary[]> {
  const url = `${cleanUrl(config.plexUrl)}/library/sections`;
  const res = await fetch(url, {
    headers: {
      'X-Plex-Token': config.plexToken,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch Plex libraries');
  const data = await res.json();
  return data.MediaContainer.Directory.filter((d: any) => d.type === 'show').map((d: any) => ({
    key: d.key,
    title: d.title,
    type: d.type,
  }));
}

export async function getPlexEpisodes(config: Config, libraryKey: string): Promise<PlexEpisode[]> {
  const url = `${cleanUrl(config.plexUrl)}/library/sections/${libraryKey}/all?type=4`;
  const res = await fetch(url, {
    headers: {
      'X-Plex-Token': config.plexToken,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch Plex episodes for library ' + libraryKey);
  const data = await res.json();
  
  if (!data.MediaContainer.Metadata) return [];
  
  return data.MediaContainer.Metadata.map((d: any) => ({
    ratingKey: d.ratingKey,
    grandparentTitle: d.grandparentTitle,
    parentIndex: d.parentIndex,
    index: d.index,
  }));
}

export async function getSonarrSeries(config: Config): Promise<SonarrSeries[]> {
  const url = `${cleanUrl(config.sonarrUrl)}/api/v3/series`;
  const res = await fetch(url, {
    headers: {
      'X-Api-Key': config.sonarrApiKey,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch Sonarr series');
  const data = await res.json();
  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    cleanTitle: d.cleanTitle,
    year: d.year,
  }));
}

export async function getSonarrEpisodes(config: Config, seriesId: number): Promise<SonarrEpisode[]> {
  const url = `${cleanUrl(config.sonarrUrl)}/api/v3/episode?seriesId=${seriesId}`;
  const res = await fetch(url, {
    headers: {
      'X-Api-Key': config.sonarrApiKey,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch Sonarr episodes for series ' + seriesId);
  const data = await res.json();
  return data.map((d: any) => ({
    id: d.id,
    seriesId: d.seriesId,
    seasonNumber: d.seasonNumber,
    episodeNumber: d.episodeNumber,
    monitored: d.monitored,
    hasFile: d.hasFile,
  }));
}

export async function unmonitorSonarrEpisodes(config: Config, episodeIds: number[]): Promise<void> {
  const url = `${cleanUrl(config.sonarrUrl)}/api/v3/episode/monitor`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Api-Key': config.sonarrApiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      episodeIds,
      monitored: false,
    }),
  });
  if (!res.ok) throw new Error('Failed to update Sonarr episodes');
}

export function normalizeTitle(title: string): string {
  if (!title) return '';
  let t = title.toLowerCase();
  t = t.replace(/\(\d{4}\)/g, ''); // remove (YYYY)
  return t.replace(/[^a-z0-9]/g, '');
}
