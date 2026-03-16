# Lyric Book Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React SPA for playing music with side-by-side original/Vietnamese lyrics, hosted on GitHub Pages, with in-app editing via GitHub API.

**Architecture:** React SPA with HashRouter for GitHub Pages compatibility. Song data stored as `public/songs.json`, fetched at runtime. Admin mode writes via GitHub Contents API with SHA-based conflict prevention. Audio served from external URLs. After an admin save, local state updates immediately; the deployed site catches up after GitHub Actions redeploys (1-3 minutes).

**Tech Stack:** React 18, Vite, Tailwind CSS 4, React Router 7 (HashRouter), @octokit/rest, Vitest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-16-lyric-book-design.md`

---

## File Structure

```
├── .github/workflows/deploy.yml
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── songs.json                  # Song data (read at runtime, written via GitHub API)
├── src/
│   ├── main.jsx                    # ReactDOM.createRoot + HashRouter
│   ├── App.jsx                     # Top-level layout: sidebar + main area + admin wiring
│   ├── index.css                   # Tailwind directives + custom dark theme
│   ├── context/
│   │   └── SongsContext.jsx        # Song list state, load/save, current song selection
│   ├── components/
│   │   ├── Sidebar.jsx             # Collapsible song list (drawer on mobile)
│   │   ├── MusicPlayer.jsx         # Audio controls, progress bar, volume
│   │   ├── LyricsPanel.jsx         # Split original/translation with synced scroll
│   │   ├── AdminModal.jsx          # Add/edit/delete song form
│   │   ├── TokenSetup.jsx          # GitHub token input + validation
│   │   └── Toast.jsx               # Notification overlay
│   ├── hooks/
│   │   ├── useAudioPlayer.js       # HTML5 Audio wrapper: play/pause/seek/volume/events
│   │   ├── useToast.js             # Show/hide toast with auto-dismiss
│   │   └── useScrollSync.js        # One-directional percentage-based scroll sync
│   └── lib/
│       ├── constants.js            # Repo owner/name, localStorage keys
│       └── github.js               # GitHub Contents API: read SHA, update file
└── tests/
    ├── setup.js                    # Vitest + jsdom setup
    ├── hooks/
    │   └── useAudioPlayer.test.js
    └── lib/
        └── github.test.js
```

---

## Chunk 1: Foundation

### Task 1: Scaffold Vite + React + Tailwind Project

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `src/lib/constants.js`, `tests/setup.js`, `public/songs.json`

- [ ] **Step 1: Scaffold Vite React project**

```bash
cd /Users/sampi_wu/Documents/GitHub/Lyric-Book
npm create vite@latest . -- --template react
```

Accept overwrite prompts.

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom @octokit/rest
npm install -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Add test script to package.json**

Ensure `package.json` scripts include:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run"
}
```

- [ ] **Step 4: Configure Vite with Tailwind**

Replace `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Lyric-Book/',
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
})
```

- [ ] **Step 5: Set up Tailwind CSS entry**

Replace `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #12121a;
  --color-bg-glass: rgba(255, 255, 255, 0.05);
  --color-border-glass: rgba(255, 255, 255, 0.1);
  --color-accent: #8b5cf6;
  --color-accent-hover: #a78bfa;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
}
```

- [ ] **Step 6: Create test setup file**

Create `tests/setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Create constants file**

Create `src/lib/constants.js`:

```js
export const REPO_OWNER = 'Sampi314'
export const REPO_NAME = 'Lyric-Book'
export const STORAGE_KEYS = {
  token: 'lyricbook-gh-token',
  volume: 'lyricbook-volume',
}
```

- [ ] **Step 8: Create empty songs.json**

Create `public/songs.json`:

```json
[]
```

- [ ] **Step 9: Clean up scaffold files**

Remove: `src/App.css`, `src/assets/`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + Tailwind project"
```

---

### Task 2: App Shell with Routing and Layout

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`
- Modify: `index.html`

- [ ] **Step 1: Set up HashRouter in main.jsx**

Replace `src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
```

- [ ] **Step 2: Create App shell layout**

Replace `src/App.jsx`:

```jsx
export default function App() {
  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      {/* Sidebar placeholder */}
      <aside className="w-64 bg-bg-secondary border-r border-border-glass flex-shrink-0">
        <div className="p-4 text-lg font-bold">Lyric Book</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Player placeholder */}
        <div className="h-24 bg-bg-secondary border-b border-border-glass flex items-center justify-center text-text-secondary">
          Music Player
        </div>

        {/* Lyrics placeholder */}
        <div className="flex-1 flex items-center justify-center text-text-secondary">
          Select a song from the sidebar
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Update index.html**

Update `<title>` to "Lyric Book". Add Inter font in `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Add to `<body>`: `style="font-family: 'Inter', sans-serif;"`

- [ ] **Step 4: Verify app runs**

```bash
npm run dev
```

Verify: dark background, sidebar on left, placeholders visible.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: app shell with routing and dark theme layout"
```

---

### Task 3: Songs Context and Data Loading

**Files:**
- Create: `src/context/SongsContext.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create SongsContext**

Create `src/context/SongsContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SongsContext = createContext(null)

export function SongsProvider({ children }) {
  const [songs, setSongs] = useState([])
  const [currentSongId, setCurrentSongId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const currentSong = songs.find(s => s.id === currentSongId) || null
  const currentIndex = songs.findIndex(s => s.id === currentSongId)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}songs.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load songs')
        return res.json()
      })
      .then(data => {
        setSongs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setSongs([])
        setLoading(false)
        setError(err.message)
      })
  }, [])

  const nextSong = useCallback(() => {
    if (songs.length === 0) return
    const nextIndex = (currentIndex + 1) % songs.length
    setCurrentSongId(songs[nextIndex].id)
  }, [songs, currentIndex])

  const prevSong = useCallback(() => {
    if (songs.length === 0) return
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length
    setCurrentSongId(songs[prevIndex].id)
  }, [songs, currentIndex])

  const value = {
    songs,
    setSongs,
    currentSong,
    currentSongId,
    setCurrentSongId,
    nextSong,
    prevSong,
    loading,
    error,
  }

  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>
}

export function useSongs() {
  const ctx = useContext(SongsContext)
  if (!ctx) throw new Error('useSongs must be used within SongsProvider')
  return ctx
}
```

- [ ] **Step 2: Wrap App with SongsProvider**

Update `src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { SongsProvider } from './context/SongsContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <SongsProvider>
        <App />
      </SongsProvider>
    </HashRouter>
  </StrictMode>,
)
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: songs context with data loading and navigation"
```

---

## Chunk 2: Core UI Components

### Task 4: Sidebar Component

**Files:**
- Create: `src/components/Sidebar.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create Sidebar component**

Create `src/components/Sidebar.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSongs } from '../context/SongsContext'

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false)
  const { songs, currentSongId, setCurrentSongId, loading } = useSongs()
  const navigate = useNavigate()

  const handleSelect = (song) => {
    setCurrentSongId(song.id)
    navigate(`/songs/${song.id}`)
    if (onMobileClose) onMobileClose()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          ${collapsed ? 'w-12' : 'w-64'}
          bg-bg-secondary border-r border-border-glass flex-shrink-0 flex flex-col
          transition-all duration-300 overflow-hidden
          fixed md:relative inset-y-0 left-0 z-40
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border-glass">
          {!collapsed && <span className="text-lg font-bold truncate">Lyric Book</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-bg-glass text-text-secondary hover:text-text-primary transition-colors hidden md:block"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-bg-glass text-text-secondary hover:text-text-primary transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto">
          {loading && !collapsed && (
            <p className="p-3 text-text-secondary text-sm">Loading...</p>
          )}
          {!loading && songs.length === 0 && !collapsed && (
            <p className="p-3 text-text-secondary text-sm">No songs yet. Add one!</p>
          )}
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => handleSelect(song)}
              className={`w-full text-left px-3 py-2.5 transition-colors truncate ${
                song.id === currentSongId
                  ? 'bg-accent/20 text-accent-hover border-r-2 border-accent'
                  : 'hover:bg-bg-glass text-text-secondary hover:text-text-primary'
              }`}
              title={`${song.title} — ${song.artist}`}
            >
              {collapsed ? (
                <span className="text-xs">{song.title?.[0] || '♪'}</span>
              ) : (
                <div>
                  <div className="text-sm font-medium truncate">{song.title}</div>
                  <div className="text-xs text-text-secondary truncate">{song.artist}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}
```

- [ ] **Step 2: Update App.jsx with Sidebar and mobile toggle**

Replace `src/App.jsx`:

```jsx
import { useState } from 'react'
import Sidebar from './components/Sidebar'

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <div className="h-12 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-glass px-4 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-text-secondary hover:text-text-primary"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="text-sm font-semibold md:hidden">Lyric Book</span>
        </div>

        {/* Player placeholder */}
        <div className="h-24 bg-bg-secondary border-b border-border-glass flex items-center justify-center text-text-secondary">
          Music Player
        </div>

        {/* Lyrics placeholder */}
        <div className="flex-1 flex items-center justify-center text-text-secondary">
          Select a song from the sidebar
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verify sidebar renders and collapses**

Run `npm run dev`. Verify: sidebar shows, collapse/expand works, mobile drawer behavior at narrow viewport.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: collapsible sidebar with mobile drawer"
```

---

### Task 5: Audio Player Hook

**Files:**
- Create: `src/hooks/useAudioPlayer.js`
- Create: `tests/hooks/useAudioPlayer.test.js`

- [ ] **Step 1: Write tests for useAudioPlayer**

Create `tests/hooks/useAudioPlayer.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer'

class MockAudio {
  constructor() {
    this.src = ''
    this.currentTime = 0
    this.duration = 200
    this.volume = 1
    this.paused = true
    this._listeners = {}
  }
  play() { this.paused = false; return Promise.resolve() }
  pause() { this.paused = true }
  addEventListener(event, cb) { this._listeners[event] = cb }
  removeEventListener() {}
  load() {}
}

beforeEach(() => {
  vi.stubGlobal('Audio', MockAudio)
  localStorage.clear()
})

describe('useAudioPlayer', () => {
  it('initializes with paused state', () => {
    const { result } = renderHook(() => useAudioPlayer())
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.currentTime).toBe(0)
    expect(result.current.duration).toBe(0)
  })

  it('loads a new source', () => {
    const { result } = renderHook(() => useAudioPlayer())
    act(() => result.current.loadSong('https://example.com/song.mp3'))
    expect(result.current.isPlaying).toBe(false)
  })

  it('toggles play/pause', async () => {
    const { result } = renderHook(() => useAudioPlayer())
    act(() => result.current.loadSong('https://example.com/song.mp3'))
    await act(async () => result.current.togglePlay())
    expect(result.current.isPlaying).toBe(true)
    await act(async () => result.current.togglePlay())
    expect(result.current.isPlaying).toBe(false)
  })

  it('sets volume and persists to localStorage', () => {
    const { result } = renderHook(() => useAudioPlayer())
    act(() => result.current.setVolume(0.5))
    expect(result.current.volume).toBe(0.5)
    expect(localStorage.getItem('lyricbook-volume')).toBe('0.5')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement useAudioPlayer**

Create `src/hooks/useAudioPlayer.js`:

```js
import { useState, useRef, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../lib/constants'

export function useAudioPlayer() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.volume)
    return saved ? parseFloat(saved) : 0.8
  })
  const [audioError, setAudioError] = useState(null)
  const onEndedRef = useRef(null)

  useEffect(() => {
    const audio = new Audio()
    audio.volume = volume
    audioRef.current = audio

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      setIsPlaying(false)
      if (onEndedRef.current) onEndedRef.current()
    }
    const onError = () => {
      setIsPlaying(false)
      setAudioError('Audio unavailable')
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.pause()
    }
  }, [])

  const loadSong = useCallback((url) => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = url
    audio.load()
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
    setAudioError(null)
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !audio.src) return
    if (audio.paused) {
      await audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [])

  const seek = useCallback((time) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((v) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)
    if (audioRef.current) audioRef.current.volume = clamped
    localStorage.setItem(STORAGE_KEYS.volume, String(clamped))
  }, [])

  const setOnEnded = useCallback((cb) => {
    onEndedRef.current = cb
  }, [])

  return {
    isPlaying, currentTime, duration, volume, audioError,
    loadSong, togglePlay, seek, setVolume, setOnEnded,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: useAudioPlayer hook with tests"
```

---

### Task 6: Music Player Component

**Files:**
- Create: `src/components/MusicPlayer.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create MusicPlayer component**

Create `src/components/MusicPlayer.jsx`:

```jsx
import { useEffect } from 'react'
import { useSongs } from '../context/SongsContext'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MusicPlayer({ player }) {
  const { currentSong, nextSong, prevSong } = useSongs()
  const {
    isPlaying, currentTime, duration, volume, audioError,
    loadSong, togglePlay, seek, setVolume, setOnEnded,
  } = player

  useEffect(() => {
    if (currentSong?.audioUrl) {
      loadSong(currentSong.audioUrl)
    }
  }, [currentSong?.id, loadSong])

  useEffect(() => {
    setOnEnded(nextSong)
  }, [nextSong, setOnEnded])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="h-24 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-glass px-4 flex items-center gap-4">
      {/* Song info */}
      <div className="w-48 flex-shrink-0 truncate hidden sm:block">
        {currentSong ? (
          <>
            <div className="text-sm font-semibold truncate">{currentSong.title}</div>
            <div className="text-xs text-text-secondary truncate">{currentSong.artist}</div>
          </>
        ) : (
          <div className="text-sm text-text-secondary">No song selected</div>
        )}
        {audioError && currentSong && (
          <div className="text-xs text-red-400 truncate" title={currentSong.audioUrl}>
            {audioError}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="flex items-center gap-4">
          <button
            onClick={prevSong}
            className="text-text-secondary hover:text-text-primary transition-colors text-lg"
            aria-label="Previous"
          >
            ⏮
          </button>
          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className="w-10 h-10 rounded-full bg-accent hover:bg-accent-hover transition-colors flex items-center justify-center text-white disabled:opacity-40"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={nextSong}
            className="text-text-secondary hover:text-text-primary transition-colors text-lg"
            aria-label="Next"
          >
            ⏭
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xl flex items-center gap-2 text-xs text-text-secondary">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-1.5 bg-bg-glass rounded-full cursor-pointer group"
            onClick={(e) => {
              if (!duration) return
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              seek(pct * duration)
            }}
          >
            <div
              className="h-full bg-accent rounded-full relative group-hover:bg-accent-hover transition-colors"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume (hidden on mobile) */}
      <div className="w-32 items-center gap-2 flex-shrink-0 hidden md:flex">
        <span className="text-sm">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full accent-accent"
          aria-label="Volume"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update App.jsx with MusicPlayer**

Update `src/App.jsx` — import `useAudioPlayer` and `MusicPlayer`, create player at App level, replace placeholder:

```jsx
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MusicPlayer from './components/MusicPlayer'
import { useAudioPlayer } from './hooks/useAudioPlayer'

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const player = useAudioPlayer()

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <div className="h-12 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-glass px-4 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-text-secondary hover:text-text-primary"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="text-sm font-semibold md:hidden">Lyric Book</span>
        </div>

        <MusicPlayer player={player} />

        {/* Lyrics placeholder */}
        <div className="flex-1 flex items-center justify-center text-text-secondary">
          Select a song from the sidebar
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verify player renders**

Run `npm run dev`. Verify: player bar shows with controls, "No song selected" text.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: music player component with controls and progress bar"
```

---

### Task 7: Lyrics Panel Component

**Files:**
- Create: `src/hooks/useScrollSync.js`
- Create: `src/components/LyricsPanel.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create useScrollSync hook**

Create `src/hooks/useScrollSync.js`:

```js
import { useEffect, useRef } from 'react'

export function useScrollSync() {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const isSyncing = useRef(false)

  useEffect(() => {
    const left = leftRef.current
    const right = rightRef.current
    if (!left || !right) return

    const handleScroll = () => {
      if (isSyncing.current) return

      const maxScroll = left.scrollHeight - left.clientHeight
      if (maxScroll <= 0) return

      isSyncing.current = true
      const scrollPct = left.scrollTop / maxScroll
      right.scrollTop = scrollPct * (right.scrollHeight - right.clientHeight)

      requestAnimationFrame(() => {
        isSyncing.current = false
      })
    }

    left.addEventListener('scroll', handleScroll, { passive: true })
    return () => left.removeEventListener('scroll', handleScroll)
  }, [])

  return { leftRef, rightRef }
}
```

- [ ] **Step 2: Create LyricsPanel component**

Create `src/components/LyricsPanel.jsx`:

```jsx
import { useSongs } from '../context/SongsContext'
import { useScrollSync } from '../hooks/useScrollSync'

function parseVerses(text) {
  if (!text) return []
  return text.split('\n\n').map((verse, i) => ({
    id: i,
    lines: verse.split('\n').filter(Boolean),
  }))
}

export default function LyricsPanel() {
  const { currentSong, songs } = useSongs()
  const { leftRef, rightRef } = useScrollSync()

  if (songs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        Add your first song
      </div>
    )
  }

  if (!currentSong) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        Select a song from the sidebar
      </div>
    )
  }

  const originalVerses = parseVerses(currentSong.lyrics)
  const translationVerses = parseVerses(currentSong.translation)

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0">
      {/* Original lyrics */}
      <div
        ref={leftRef}
        className="flex-1 overflow-y-auto p-6 border-b md:border-b-0 md:border-r border-border-glass"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Original
        </h3>
        {originalVerses.map((verse) => (
          <div key={verse.id} className="mb-6">
            {verse.lines.map((line, i) => (
              <p key={i} className="text-text-primary leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* Vietnamese translation */}
      <div
        ref={rightRef}
        className="flex-1 overflow-y-auto p-6"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Tiếng Việt
        </h3>
        {translationVerses.map((verse) => (
          <div key={verse.id} className="mb-6">
            {verse.lines.map((line, i) => (
              <p key={i} className="text-text-primary leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update App.jsx with LyricsPanel and route sync**

Replace `src/App.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MusicPlayer from './components/MusicPlayer'
import LyricsPanel from './components/LyricsPanel'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useSongs } from './context/SongsContext'

function SongRoute() {
  const { id } = useParams()
  const { setCurrentSongId } = useSongs()
  useEffect(() => {
    if (id) setCurrentSongId(id)
  }, [id, setCurrentSongId])
  return <LyricsPanel />
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const player = useAudioPlayer()

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <div className="h-12 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-glass px-4 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-text-secondary hover:text-text-primary"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="text-sm font-semibold md:hidden">Lyric Book</span>
        </div>

        <MusicPlayer player={player} />

        <Routes>
          <Route path="/" element={<LyricsPanel />} />
          <Route path="/songs/:id" element={<SongRoute />} />
        </Routes>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Add test song to verify**

Update `public/songs.json`:

```json
[
  {
    "id": "1",
    "title": "Test Song",
    "artist": "Test Artist",
    "audioUrl": "",
    "lyrics": "Hello world\nThis is line two\n\nSecond verse here\nAnother line",
    "translation": "Xin chào thế giới\nĐây là dòng hai\n\nĐoạn thứ hai đây\nMột dòng nữa"
  }
]
```

Run `npm run dev`. Click "Test Song". Verify: lyrics split left/right, scroll sync works, stacks vertically at narrow viewport.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: lyrics panel with scroll sync and verse parsing"
```

---

## Chunk 3: Admin Mode & GitHub API

### Task 8: GitHub API Module

**Files:**
- Create: `src/lib/github.js`
- Create: `tests/lib/github.test.js`

- [ ] **Step 1: Write tests for github module**

Create `tests/lib/github.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSongsFile, updateSongsFile } from '../../src/lib/github'

const mockOctokit = {
  rest: {
    repos: {
      getContent: vi.fn(),
      createOrUpdateFileContents: vi.fn(),
    },
  },
}

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => mockOctokit),
}))

describe('github', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getSongsFile returns parsed songs and sha', async () => {
    const songData = [{ id: '1', title: 'Test' }]
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(songData))))
    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: { sha: 'abc123', content: encoded },
    })

    const result = await getSongsFile('token', 'owner', 'repo')
    expect(result.sha).toBe('abc123')
    expect(result.songs).toEqual(songData)
  })

  it('getSongsFile handles Vietnamese characters', async () => {
    const songData = [{ id: '1', title: 'Bài hát', lyrics: 'Xin chào thế giới' }]
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(songData))))
    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: { sha: 'def456', content: encoded },
    })

    const result = await getSongsFile('token', 'owner', 'repo')
    expect(result.songs[0].lyrics).toBe('Xin chào thế giới')
  })

  it('updateSongsFile calls API with SHA', async () => {
    mockOctokit.rest.repos.createOrUpdateFileContents.mockResolvedValue({ data: {} })

    await updateSongsFile('token', 'owner', 'repo', [{ id: '1' }], 'abc123')

    expect(mockOctokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: 'public/songs.json',
      message: 'Update songs.json via Lyric Book',
      content: expect.any(String),
      sha: 'abc123',
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement github module**

Create `src/lib/github.js`:

```js
import { Octokit } from '@octokit/rest'

function base64ToUtf8(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

export async function getSongsFile(token, owner, repo) {
  const octokit = new Octokit({ auth: token })
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: 'public/songs.json',
  })

  const content = base64ToUtf8(data.content)
  const songs = JSON.parse(content)
  return { songs, sha: data.sha }
}

export async function updateSongsFile(token, owner, repo, songs, sha) {
  const octokit = new Octokit({ auth: token })
  const content = utf8ToBase64(JSON.stringify(songs, null, 2))
  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: 'public/songs.json',
    message: 'Update songs.json via Lyric Book',
    content,
    sha,
  })
}

export async function validateToken(token, owner, repo) {
  try {
    const octokit = new Octokit({ auth: token })
    const { data } = await octokit.rest.repos.get({ owner, repo })
    return data.permissions?.push === true
  } catch {
    return false
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: GitHub API module with UTF-8 safe base64 encoding"
```

---

### Task 9: Toast Notification

**Files:**
- Create: `src/hooks/useToast.js`
- Create: `src/components/Toast.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create useToast hook**

Create `src/hooks/useToast.js`:

```js
import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type })
    timerRef.current = setTimeout(() => setToast(null), duration)
  }, [])

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  return { toast, showToast, dismissToast }
}
```

- [ ] **Step 2: Create Toast component**

Create `src/components/Toast.jsx`:

```jsx
const typeStyles = {
  info: 'bg-accent/90 text-white',
  success: 'bg-emerald-500/90 text-white',
  error: 'bg-red-500/90 text-white',
}

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div
        className={`${typeStyles[toast.type] || typeStyles.info} px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-3 max-w-sm`}
      >
        <span className="text-sm">{toast.message}</span>
        <button onClick={onDismiss} className="text-white/70 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add animations to index.css**

Append to `src/index.css`:

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: toast notification system"
```

---

### Task 10: Token Setup Component

**Files:**
- Create: `src/components/TokenSetup.jsx`

- [ ] **Step 1: Create TokenSetup modal**

Create `src/components/TokenSetup.jsx`:

```jsx
import { useState } from 'react'
import { validateToken } from '../lib/github'
import { REPO_OWNER, REPO_NAME, STORAGE_KEYS } from '../lib/constants'

export default function TokenSetup({ onSave, onClose }) {
  const [token, setToken] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState(null)
  const hasExistingToken = Boolean(localStorage.getItem(STORAGE_KEYS.token))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidating(true)
    setError(null)

    const valid = await validateToken(token.trim(), REPO_OWNER, REPO_NAME)
    setValidating(false)

    if (valid) {
      localStorage.setItem(STORAGE_KEYS.token, token.trim())
      onSave(token.trim())
    } else {
      setError('Token is invalid or does not have write access to this repo.')
    }
  }

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEYS.token)
    onSave(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-glass rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold mb-2">GitHub Token Setup</h2>
        <p className="text-sm text-text-secondary mb-4">
          Create a <span className="text-accent">Personal Access Token</span> with{' '}
          <code className="text-xs bg-bg-glass px-1 py-0.5 rounded">repo</code> scope
          (or <code className="text-xs bg-bg-glass px-1 py-0.5 rounded">public_repo</code> for public repos).
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full bg-bg-primary border border-border-glass rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent mb-3"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex items-center justify-between">
            <div>
              {hasExistingToken && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  Clear Token
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!token.trim() || validating}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-xl text-sm text-white transition-colors disabled:opacity-40"
              >
                {validating ? 'Validating...' : 'Save Token'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: token setup modal with validation and clear option"
```

---

### Task 11: Admin Modal Component

**Files:**
- Create: `src/components/AdminModal.jsx`

- [ ] **Step 1: Create AdminModal**

Create `src/components/AdminModal.jsx`:

```jsx
import { useState, useEffect } from 'react'

export default function AdminModal({ song, onSave, onDelete, onClose, saving }) {
  const [form, setForm] = useState({
    title: '',
    artist: '',
    audioUrl: '',
    lyrics: '',
    translation: '',
  })

  const isEdit = Boolean(song)

  useEffect(() => {
    if (song) {
      setForm({
        title: song.title || '',
        artist: song.artist || '',
        audioUrl: song.audioUrl || '',
        lyrics: song.lyrics || '',
        translation: song.translation || '',
      })
    }
  }, [song])

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      id: song?.id || Date.now().toString(),
      ...form,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-glass rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">
          {isEdit ? 'Edit Song' : 'Add Song'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Title</label>
              <input
                value={form.title}
                onChange={handleChange('title')}
                required
                className="w-full bg-bg-primary border border-border-glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Artist</label>
              <input
                value={form.artist}
                onChange={handleChange('artist')}
                className="w-full bg-bg-primary border border-border-glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Audio URL</label>
            <input
              value={form.audioUrl}
              onChange={handleChange('audioUrl')}
              placeholder="https://..."
              className="w-full bg-bg-primary border border-border-glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Original Lyrics</label>
              <textarea
                value={form.lyrics}
                onChange={handleChange('lyrics')}
                rows={10}
                placeholder="Verse 1 line 1&#10;Verse 1 line 2&#10;&#10;Verse 2 line 1..."
                className="w-full bg-bg-primary border border-border-glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent resize-y font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Vietnamese Translation</label>
              <textarea
                value={form.translation}
                onChange={handleChange('translation')}
                rows={10}
                placeholder="Đoạn 1 dòng 1&#10;Đoạn 1 dòng 2&#10;&#10;Đoạn 2 dòng 1..."
                className="w-full bg-bg-primary border border-border-glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent resize-y font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => onDelete(song.id)}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  Delete Song
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!form.title.trim() || saving}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-xl text-sm text-white transition-colors disabled:opacity-40"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: admin modal for adding and editing songs"
```

---

### Task 12: Wire Admin Mode into App

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace App.jsx with full admin wiring**

Replace `src/App.jsx` with the final version:

```jsx
import { useState, useEffect } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MusicPlayer from './components/MusicPlayer'
import LyricsPanel from './components/LyricsPanel'
import AdminModal from './components/AdminModal'
import TokenSetup from './components/TokenSetup'
import Toast from './components/Toast'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useToast } from './hooks/useToast'
import { useSongs } from './context/SongsContext'
import { getSongsFile, updateSongsFile } from './lib/github'
import { REPO_OWNER, REPO_NAME, STORAGE_KEYS } from './lib/constants'

function SongRoute() {
  const { id } = useParams()
  const { setCurrentSongId } = useSongs()
  useEffect(() => {
    if (id) setCurrentSongId(id)
  }, [id, setCurrentSongId])
  return <LyricsPanel />
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [editingSong, setEditingSong] = useState(null) // null = new song, song object = editing
  const [showTokenSetup, setShowTokenSetup] = useState(false)
  const [saving, setSaving] = useState(false)

  const player = useAudioPlayer()
  const { toast, showToast, dismissToast } = useToast()
  const { songs, setSongs, currentSong } = useSongs()

  const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.token))

  // Save song via GitHub API
  const handleSaveSong = async (songData) => {
    const token = localStorage.getItem(STORAGE_KEYS.token)
    if (!token) {
      setShowTokenSetup(true)
      return
    }

    setSaving(true)
    try {
      const { songs: remoteSongs, sha } = await getSongsFile(token, REPO_OWNER, REPO_NAME)
      let updated
      const exists = remoteSongs.find(s => s.id === songData.id)
      if (exists) {
        updated = remoteSongs.map(s => s.id === songData.id ? songData : s)
      } else {
        updated = [...remoteSongs, songData]
      }
      await updateSongsFile(token, REPO_OWNER, REPO_NAME, updated, sha)
      setSongs(updated) // Update local state immediately
      setShowAdmin(false)
      setEditingSong(null)
      showToast('Song saved! Site will redeploy shortly.', 'success')
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete song via GitHub API
  const handleDeleteSong = async (songId) => {
    const token = localStorage.getItem(STORAGE_KEYS.token)
    if (!token) return

    setSaving(true)
    try {
      const { songs: remoteSongs, sha } = await getSongsFile(token, REPO_OWNER, REPO_NAME)
      const updated = remoteSongs.filter(s => s.id !== songId)
      await updateSongsFile(token, REPO_OWNER, REPO_NAME, updated, sha)
      setSongs(updated)
      setShowAdmin(false)
      setEditingSong(null)
      showToast('Song deleted.', 'info')
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTokenSave = (token) => {
    setShowTokenSetup(false)
    if (token) {
      showToast('Token saved successfully.', 'success')
    }
  }

  const openAddSong = () => {
    if (!hasToken) {
      setShowTokenSetup(true)
      return
    }
    setEditingSong(null)
    setShowAdmin(true)
  }

  const openEditSong = () => {
    if (!hasToken) {
      setShowTokenSetup(true)
      return
    }
    setEditingSong(currentSong)
    setShowAdmin(true)
  }

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <div className="h-12 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-glass px-4 flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-text-secondary hover:text-text-primary"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="text-sm font-semibold md:hidden">Lyric Book</span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons */}
          <button
            onClick={openAddSong}
            className="px-3 py-1.5 text-xs bg-accent hover:bg-accent-hover rounded-lg text-white transition-colors"
          >
            + Add Song
          </button>
          {currentSong && (
            <button
              onClick={openEditSong}
              className="px-3 py-1.5 text-xs bg-bg-glass hover:bg-border-glass rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => setShowTokenSetup(true)}
            className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Settings"
            title="GitHub token settings"
          >
            ⚙
          </button>
        </div>

        <MusicPlayer player={player} />

        <Routes>
          <Route path="/" element={<LyricsPanel />} />
          <Route path="/songs/:id" element={<SongRoute />} />
        </Routes>
      </main>

      {/* Modals */}
      {showAdmin && (
        <AdminModal
          song={editingSong}
          onSave={handleSaveSong}
          onDelete={handleDeleteSong}
          onClose={() => { setShowAdmin(false); setEditingSong(null) }}
          saving={saving}
        />
      )}

      {showTokenSetup && (
        <TokenSetup
          onSave={handleTokenSave}
          onClose={() => setShowTokenSetup(false)}
        />
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
```

- [ ] **Step 2: Verify full admin flow**

Run `npm run dev`. Test:
1. Click ⚙ → token setup modal appears with "Clear Token" option
2. Click "+ Add Song" → if no token, prompts for token first; otherwise opens admin modal
3. Fill in song fields → Save → local song list updates, toast confirms
4. Click a song → click "Edit" → prefilled form → save
5. Delete a song from edit mode

Note: GitHub API calls require a real token and the repo to be pushed to GitHub.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: wire admin mode with full GitHub API integration"
```

---

## Chunk 4: Deployment & Polish

### Task 13: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create deployment workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run build

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Document required GitHub repo settings**

**IMPORTANT:** After pushing to GitHub, go to the repo Settings:
1. Navigate to **Settings → Pages**
2. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
3. Save

Without this, the workflow will not deploy.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Actions deployment workflow"
```

---

### Task 14: Final Cleanup and Verification

**Files:**
- Modify: `public/songs.json`

- [ ] **Step 1: Reset songs.json to empty**

Reset `public/songs.json` back to:

```json
[]
```

- [ ] **Step 2: Run full build and tests**

```bash
npm run build && npm test
```

Expected: build succeeds, all tests pass.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: clean up test data, ready for deployment"
```

---

## Summary

| Chunk | Tasks | What it builds |
|-------|-------|----------------|
| 1: Foundation | 1-3 | Scaffolding, routing, songs context, constants |
| 2: Core UI | 4-7 | Sidebar (with mobile drawer), audio player, music player, lyrics panel |
| 3: Admin & API | 8-12 | GitHub API (UTF-8 safe), toasts, token setup (with clear), admin modal, full wiring |
| 4: Deploy & Polish | 13-14 | GitHub Actions workflow, cleanup, verification |

**Post-deploy note:** After an admin save, local state updates immediately. The deployed GitHub Pages site refreshes after GitHub Actions redeploys (typically 1-3 minutes). A page refresh during this window will show the previous version until the deploy completes.
