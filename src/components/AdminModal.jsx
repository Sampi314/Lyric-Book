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
