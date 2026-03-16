# Lyric Book — Design Spec

## Overview

A static web app hosted on GitHub Pages for storing and playing music with side-by-side original lyrics and Vietnamese translations. All song data lives in the GitHub repo and is editable from the app itself via the GitHub API. This is a personal tool — single user (repo owner) only.

## Layout

### Collapsible Left Sidebar
- Lists all song names
- Click a song to load it into the main area
- Toggle button (hamburger/arrow) to expand/collapse
- When collapsed, shows only the toggle icon to maximize main content space
- On mobile: sidebar becomes a slide-out drawer

### Main Area — Music Player (Top)
- Full-width player bar
- Controls: play/pause, previous/next, progress bar with scrubber, volume, current time / duration
- Displays song title and artist name
- Previous/next follows the order in `songs.json`; wraps around at boundaries
- Auto-advances to next song when current one ends
- Volume preference persisted in localStorage

### Main Area — Lyrics Panel (Bottom)
- Split 50/50 horizontally (stacks vertically on mobile)
- Left: original lyrics (scrollable, styled as verse blocks)
- Right: Vietnamese translation (scrollable)
- Scroll sync: left panel drives right panel (one-directional, percentage-based)
- Verse blocks separated by double newlines (`\n\n`) in the lyrics string
- Empty state: "Select a song from the sidebar" when no song is selected

### Admin Mode
- Accessed via a settings/edit icon in the header
- Overlay/modal for song management: add, edit, delete songs
- Fields: title, artist, audio URL (paste external link), original lyrics textarea, translation textarea
- Save commits changes to the GitHub repo via API
- On first use: prompts for GitHub personal access token, validates it has repo write access, then stores in localStorage
- Settings option to clear/change the stored token

## Data Model

Song data stored as `songs.json` in the repo root:

```json
[
  {
    "id": "1710567600000",
    "title": "Song Title",
    "artist": "Artist Name",
    "audioUrl": "https://cdn.example.com/song.mp3",
    "lyrics": "Line 1\nLine 2\n\nLine 3\nLine 4",
    "translation": "Dòng 1\nDòng 2\n\nDòng 3\nDòng 4"
  }
]
```

- **IDs**: timestamp-based (`Date.now().toString()`) — simple, unique, no collisions for a single user
- **Audio files**: stored as external URLs only (not committed to the repo) to avoid repo bloat. User pastes a link to audio hosted elsewhere (e.g. Suno, Google Drive, Dropbox, any CDN)
- **GitHub API write flow**: app fetches current `songs.json` SHA before writing, includes SHA in update request to prevent conflicts. Commits directly to `main`, which triggers redeploy
- **Data loading**: `songs.json` fetched via HTTP from the deployed GitHub Pages URL at app startup (no token needed for read). GitHub API used only for writes (requires token)
- GitHub personal access token stored in browser `localStorage`

## Tech Stack

- **React 18** + **Vite** — development and build tooling
- **Tailwind CSS** — styling
- **GitHub Pages** — static hosting
- **GitHub REST API** (`@octokit/rest`) — edit/save song data from the app
- **No backend** — fully static SPA
- **HashRouter** — client-side routing compatible with GitHub Pages (no server-side fallback needed)

## Routing

- `/#/` — main view (song list + player + lyrics)
- `/#/songs/:id` — deep link to a specific song
- Browser back/forward navigates between songs

## Deployment

- `npm run build` outputs static files to `dist/`
- GitHub Actions workflow on push to `main`:
  1. Install dependencies
  2. Build the project
  3. Deploy `dist/` to `gh-pages` branch using `peaceiris/actions-gh-pages`
- GitHub Pages serves from the `gh-pages` branch

## Error Handling

- **No songs**: sidebar shows "No songs yet. Add one!", lyrics panel shows "Add your first song"
- **No song selected**: lyrics panel shows "Select a song from the sidebar"
- **Broken audio URL**: player shows "Audio unavailable" with the broken URL displayed for debugging
- **GitHub API failure**: toast notification with error message (network error, 401, rate limit). Save button re-enabled for retry
- **Missing/empty `songs.json`**: treated as empty array, app still loads

## MVP Features

1. Collapsible left sidebar with song list
2. Music player (play/pause, prev/next, progress bar, volume, time display)
3. Split lyrics panel (original left, Vietnamese translation right, synced scroll)
4. Admin mode to add/edit/delete songs (commits to GitHub repo via API)
5. GitHub token setup (one-time, validated, stored in localStorage)
6. Dark theme with polished UI (glassmorphism, smooth transitions)
7. Hash-based routing with deep links to songs
8. Responsive layout (mobile-friendly)

## Deferred (Post-MVP)

- Line-by-line lyric sync with audio playback
- Search/filter songs
- Album art display
- Audio file upload to external storage from the app
