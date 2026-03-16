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
