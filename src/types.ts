export interface Config {
  plexUrl: string;
  plexToken: string;
  sonarrUrl: string;
  sonarrApiKey: string;
}

export interface PlexLibrary {
  key: string;
  title: string;
  type: string;
}

export interface PlexEpisode {
  ratingKey: string;
  grandparentTitle: string; // Show title
  parentIndex: number; // Season
  index: number; // Episode
}

export interface SonarrSeries {
  id: number;
  title: string;
  cleanTitle: string;
  year: number;
}

export interface SonarrEpisode {
  id: number;
  seriesId: number;
  seasonNumber: number;
  episodeNumber: number;
  monitored: boolean;
  hasFile: boolean;
}

export interface SyncMatch {
  series: SonarrSeries;
  episodes: SonarrEpisode[]; // Episodes that are in Plex, but Monitored and missing in Sonarr
}
