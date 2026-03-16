import { useState, useEffect } from 'react'

function parseSunoUrl(url) {
  const match = url.match(/suno\.com\/song\/([a-f0-9-]+)/)
  return match ? match[1] : null
}

const CORS_PROXIES = [
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
]

async function fetchViaProxy(target) {
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy(target))
      if (!res.ok) continue
      const html = await res.text()
      if (html.includes('__next_f')) return html
    } catch { /* try next proxy */ }
  }
  return null
}

function extractFromHtml(html) {
  const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/)
  const title = titleMatch ? titleMatch[1] : ''

  const pageTitleMatch = html.match(/<title>(.+?)<\/title>/)
  const pageTitle = pageTitleMatch ? pageTitleMatch[1] : ''
  const artistMatch = pageTitle.match(/by\s+(.+?)\s*\|/)
  const artist = artistMatch ? artistMatch[1] : ''

  // Extract lyrics from Next.js RSC stream data
  let lyrics = ''
  const lyricsStart = html.match(/\[(?:Verse|Intro|Chorus|Pre-Chorus|Hook|Interlude|Spoken|Rap)\s*\d*\]/)
  if (lyricsStart) {
    const startIdx = lyricsStart.index
    const endIdx = html.indexOf('"])', startIdx)
    if (endIdx > startIdx) {
      lyrics = html.substring(startIdx, endIdx)
        .replace(/\\\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\\\"/g, '"')
        .replace(/\\"/g, '"')
    }
  }

  return { title, artist, lyrics }
}

async function fetchSunoMeta(songId) {
  try {
    const html = await fetchViaProxy(`https://suno.com/song/${songId}`)
    if (!html) return { title: '', artist: '', lyrics: '' }
    return extractFromHtml(html)
  } catch {
    return { title: '', artist: '', lyrics: '' }
  }
}

export default function AdminModal({ song, onSave, onDelete, onClose, saving }) {
  const [form, setForm] = useState({
    title: '',
    artist: '',
    audioUrl: '',
    lyrics: '',
    translation: '',
  })
  const [sunoUrl, setSunoUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState('')

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

  const handleSunoImport = async (url) => {
    setSunoUrl(url)
    const songId = parseSunoUrl(url)
    if (!songId) return

    setImporting(true)
    setImportStatus('Extracting song info...')

    // Always set the audio URL from the song ID
    const audioUrl = `https://cdn1.suno.ai/${songId}.mp3`

    // Try to fetch title and artist
    const meta = await fetchSunoMeta(songId)

    setForm((f) => ({
      ...f,
      audioUrl,
      ...(meta.title && !f.title ? { title: meta.title } : {}),
      ...(meta.artist && !f.artist ? { artist: meta.artist } : {}),
      ...(meta.lyrics && !f.lyrics ? { lyrics: meta.lyrics } : {}),
    }))

    setImporting(false)
    setImportStatus(
      meta.title && meta.lyrics
        ? `Imported "${meta.title}" with lyrics`
        : meta.title
          ? `Imported "${meta.title}" - paste lyrics below`
          : 'Audio URL set - paste title and lyrics below'
    )
  }

  const handleSunoUrlPaste = (e) => {
    // Handle both typing and paste events
    const value = e.target.value || (e.clipboardData && e.clipboardData.getData('text')) || ''
    if (parseSunoUrl(value)) {
      handleSunoImport(value)
    } else {
      setSunoUrl(value)
    }
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
          {/* Suno Import */}
          {!isEdit && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3">
              <label className="block text-xs text-accent font-semibold mb-1">
                Import from Suno
              </label>
              <input
                value={sunoUrl}
                onChange={handleSunoUrlPaste}
                onPaste={handleSunoUrlPaste}
                placeholder="Paste Suno URL: https://suno.com/song/..."
                className="w-full bg-bg-primary border border-border-glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                disabled={importing}
              />
              {importing && (
                <p className="text-xs text-accent mt-1 animate-pulse">Extracting...</p>
              )}
              {importStatus && !importing && (
                <p className="text-xs text-text-secondary mt-1">{importStatus}</p>
              )}
            </div>
          )}

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
                placeholder={"Verse 1 line 1\nVerse 1 line 2\n\nVerse 2 line 1..."}
                className="w-full bg-bg-primary border border-border-glass rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent resize-y font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Vietnamese Translation</label>
              <textarea
                value={form.translation}
                onChange={handleChange('translation')}
                rows={10}
                placeholder={"Verse 1 line 1\nVerse 1 line 2\n\nVerse 2 line 1..."}
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
