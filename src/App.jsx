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
            {'\u2630'}
          </button>
          <span className="text-sm font-semibold md:hidden">Lyric Book</span>
          <div className="flex-1" />
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
