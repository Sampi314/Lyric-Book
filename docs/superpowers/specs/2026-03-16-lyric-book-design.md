# Lyric Book — Design Spec

## Overview

A static web app hosted on GitHub Pages for storing and playing music with side-by-side original lyrics and Vietnamese translations. All song data lives in the GitHub repo and is editable from the app itself via the GitHub API.

## Layout

### Collapsible Left Sidebar
- Lists all song names
- Click a song to load it into the main area
- Toggle button (hamburger/arrow) to expand/collapse
- When collapsed, shows only the toggle icon to maximize main content space

### Main Area — Music Player (Top)
- Full-width player bar
- Controls: play/pause, previous/next, progress bar with scrubber, volume, current time / duration
- Displays song title and artist name

### Main Area — Lyrics Panel (Bottom)
- Split 50/50 horizontally
- Left: original lyrics (scrollable, styled as verse blocks)
- Right: Vietnamese translation (scrollable, synced scroll with left side)

### Admin Mode
- Accessed via an "Edit" button in the footer
- Overlay/modal for song management: add, edit, delete songs
- Fields: title, artist, audio file upload (or external URL), original lyrics textarea, translation textarea
- Save commits changes to the GitHub repo via API
- GitHub personal access token entered once, stored in localStorage

## Data Model

Song data stored as `songs.json` in the repo root:

```json
[
  {
    "id": "unique-id",
    "title": "Song Title",
    "artist": "Artist Name",
    "audioUrl": "audio/song-file.mp3",
    "lyrics": "Line 1\nLine 2\nLine 3...",
    "translation": "Dòng 1\nDòng 2\nDòng 3..."
  }
]
```

- Audio files stored in `/audio/` directory in the repo (or referenced by external URL)
- GitHub API reads/writes `songs.json` and uploads audio files
- GitHub personal access token stored in browser `localStorage`

## Tech Stack

- **React 18** + **Vite** — development and build tooling
- **Tailwind CSS** — styling
- **GitHub Pages** — static hosting via `gh-pages` branch
- **GitHub REST API** (`@octokit/rest`) — edit/save song data from the app
- **No backend** — fully static SPA

## Deployment

- `npm run build` outputs static files to `dist/`
- GitHub Actions workflow auto-deploys to GitHub Pages on push to `main`

## MVP Features

1. Collapsible left sidebar with song list
2. Music player (play/pause, prev/next, progress bar, volume, time display)
3. Split lyrics panel (original left, Vietnamese translation right, synced scroll)
4. Admin mode to add/edit/delete songs (commits to GitHub repo via API)
5. GitHub token setup (one-time, stored in localStorage)
6. Dark theme with polished UI (glassmorphism, smooth transitions)

## Deferred (Post-MVP)

- Line-by-line lyric sync with audio playback
- Search/filter songs
- Album art display
