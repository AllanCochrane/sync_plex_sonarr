import React, { useState, useEffect } from 'react';
import { ConfigForm } from './components/ConfigForm';
import { SyncDashboard } from './components/SyncDashboard';
import { Config } from './types';
import { Settings, Tv } from 'lucide-react';

const DEFAULT_CONFIG: Config = {
  plexUrl: '',
  plexToken: '',
  sonarrUrl: '',
  sonarrApiKey: ''
};

export default function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('plex-sonarr-sync-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    } else {
      setIsConfiguring(true);
    }
  }, []);

  const handleSaveConfig = (newConfig: Config) => {
    localStorage.setItem('plex-sonarr-sync-config', JSON.stringify(newConfig));
    setConfig(newConfig);
    setIsConfiguring(false);
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] text-slate-200 selection:bg-indigo-500/30 relative font-sans flex flex-col overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      <header className="border-b border-white/10 bg-white/5 backdrop-blur-2xl relative z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              S
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">SyncArr</h1>
          </div>
          
          {config && (
            <button
              onClick={() => setIsConfiguring(!isConfiguring)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors relative z-50 cursor-pointer"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-1 relative z-40 overflow-y-auto">
        {isConfiguring || !config ? (
          <ConfigForm 
            initialConfig={config || DEFAULT_CONFIG} 
            onSave={handleSaveConfig} 
          />
        ) : (
          <SyncDashboard config={config} />
        )}
      </main>
    </div>
  );
}
