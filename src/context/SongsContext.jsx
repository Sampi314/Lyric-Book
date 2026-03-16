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
