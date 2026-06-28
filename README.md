# Plex-Sonarr Sync

This application helps you manage your media library by automatically finding episodes that you already have in Plex, but are still being monitored and marked as missing in Sonarr. By unmonitoring these episodes in Sonarr, you prevent unnecessary duplicate downloads.

## How it works (The Mechanism)

1. **Authentication & Connection**: The app connects directly to your local or remote Plex Media Server and Sonarr instance using the provided URLs, Plex Token, and Sonarr API Key. It runs entirely in your browser; credentials are saved locally in your browser's `localStorage`.
2. **Fetch Plex Data**: It queries your Plex server for all TV show libraries and retrieves a list of all available episodes across those libraries.
3. **Fetch Sonarr Data**: It queries your Sonarr instance for all managed series and their episode statuses (specifically looking for episodes that are marked as `monitored: true` and `hasFile: false`).
4. **Title Matching**: The application matches shows between Plex and Sonarr by normalizing their titles (converting to lowercase, stripping out years like `(2023)`, and removing all non-alphanumeric characters).
5. **Episode Reconciliation**: For each matched show, the app compares the Season and Episode numbers. It builds a list of episodes that exist in Plex but are still flagged as missing and monitored in Sonarr.
6. **Batch Unmonitor**: When you click "Unmonitor All in Sonarr", the app sends a single batch API request (`PUT /api/v3/episode/monitor`) to Sonarr, setting the `monitored` flag to `false` for all identified duplicate episodes. This stops Sonarr from searching for and downloading these episodes again.

## Finding Your Tokens and Keys

### How to find your Plex Token
1. Sign in to your Plex Web App (e.g., via `app.plex.tv` or your local IP).
2. Browse to any media item in your library (like a Movie or a TV Show Episode) and view its details page.
3. Click the **More** button (the three dots `...`) in the action bar.
4. Select **Get Info**.
5. At the bottom of the pop-up dialog, click **View XML**.
6. A new browser tab will open. Look at the URL in the address bar.
7. At the very end of the URL, you will see `&X-Plex-Token=...`. The string of characters following the `=` is your Plex Token.

### How to find your Sonarr API Key
1. Open your Sonarr web interface.
2. Navigate to **Settings** in the left sidebar.
3. Click on the **General** tab.
4. Scroll down to the **Security** section.
5. You will see a field labeled **API Key**. Copy the value from this field.

## Usage

1. Open the application.
2. Enter your Plex URL (e.g., `http://192.168.1.10:32400`) and your Plex Token.
3. Enter your Sonarr URL (e.g., `http://192.168.1.10:8989`) and your Sonarr API Key.
4. Click "Save Configuration".
5. Click "Run Analysis" to let the app compare the two databases.
6. Review the list of episodes that are flagged for unmonitoring.
7. Click "Unmonitor All in Sonarr" to apply the changes.

## Note on Mixed Content

Since this applet is hosted on a secure `https://` connection, modern browsers may block requests to local, non-secure `http://` addresses (like your local Plex or Sonarr IPs). If the connections fail, you may need to allow "Insecure Content" or "Load Unsafe Scripts" via your browser's site settings (often a shield icon in the address bar), or configure HTTPS for your local media servers.
