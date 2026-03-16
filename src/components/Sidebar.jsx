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
            {collapsed ? '\u25B6' : '\u25C0'}
          </button>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-bg-glass text-text-secondary hover:text-text-primary transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            \u2715
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
                <span className="text-xs">{song.title?.[0] || '\u266A'}</span>
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
