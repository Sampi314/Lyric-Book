export default function App() {
  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      {/* Sidebar placeholder */}
      <aside className="w-64 bg-bg-secondary border-r border-border-glass flex-shrink-0">
        <div className="p-4 text-lg font-bold">Lyric Book</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Player placeholder */}
        <div className="h-24 bg-bg-secondary border-b border-border-glass flex items-center justify-center text-text-secondary">
          Music Player
        </div>

        {/* Lyrics placeholder */}
        <div className="flex-1 flex items-center justify-center text-text-secondary">
          Select a song from the sidebar
        </div>
      </main>
    </div>
  )
}
