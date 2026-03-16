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
