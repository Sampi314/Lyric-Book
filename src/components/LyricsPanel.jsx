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
          {"Ti\u1EBFng Vi\u1EC7t"}
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
