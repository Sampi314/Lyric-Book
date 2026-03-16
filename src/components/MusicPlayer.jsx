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
        <span className="text-sm">{'\uD83D\uDD0A'}</span>
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
