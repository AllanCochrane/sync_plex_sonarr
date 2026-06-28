import React, { useState } from 'react';
import { Config } from '../types';
import { Save } from 'lucide-react';

interface Props {
  initialConfig: Config;
  onSave: (config: Config) => void;
}

export function ConfigForm({ initialConfig, onSave }: Props) {
  const [config, setConfig] = useState<Config>(initialConfig);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl">
      <h2 className="text-xl font-medium text-white mb-6">Connection Setup</h2>
      
      <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-sm text-indigo-200">
        <strong>Mixed Content Warning:</strong> Since this app is hosted on HTTPS, connecting to local HTTP addresses (like <code>http://192.168...</code>) might be blocked by your browser. You may need to click the shield icon in your browser's address bar to "Load unsafe scripts" or use HTTPS for your Plex and Sonarr instances.
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Plex Configuration</h3>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Plex URL</label>
            <input
              type="text"
              required
              placeholder="http://192.168.1.10:32400"
              value={config.plexUrl}
              onChange={(e) => setConfig({ ...config, plexUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Plex Token</label>
            <input
              type="password"
              required
              value={config.plexToken}
              onChange={(e) => setConfig({ ...config, plexToken: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Sonarr Configuration</h3>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Sonarr URL</label>
            <input
              type="text"
              required
              placeholder="http://192.168.1.10:8989"
              value={config.sonarrUrl}
              onChange={(e) => setConfig({ ...config, sonarrUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Sonarr API Key</label>
            <input
              type="password"
              required
              value={config.sonarrApiKey}
              onChange={(e) => setConfig({ ...config, sonarrApiKey: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Configuration
        </button>
      </form>
    </div>
  );
}
