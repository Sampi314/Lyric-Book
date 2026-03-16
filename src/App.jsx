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
  const [editingSong, setEditingSong] = useState(null)
  const [showTokenSetup, setShowTokenSetup] = useState(false)
  const [saving, setSaving] = useState(false)

  const player = useAudioPlayer()
  const { toast, showToast, dismissToast } = useToast()
  const { songs, setSongs, currentSong } = useSongs()

  const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.token))

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
      setSongs(updated)
      setShowAdmin(false)
      setEditingSong(null)
      showToast('Song saved! Site will redeploy shortly.', 'success')
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

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
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-text-secondary hover:text-text-primary"
            aria-label="Open menu"
          >
            {'\u2630'}
          </button>
          <span className="text-sm font-semibold md:hidden">Lyric Book</span>

          <div className="flex-1" />

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
            {'\u2699'}
          </button>
        </div>

        <MusicPlayer player={player} />

        <Routes>
          <Route path="/" element={<LyricsPanel />} />
          <Route path="/songs/:id" element={<SongRoute />} />
        </Routes>
      </main>

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
