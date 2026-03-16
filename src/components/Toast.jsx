const typeStyles = {
  info: 'bg-accent/90 text-white',
  success: 'bg-emerald-500/90 text-white',
  error: 'bg-red-500/90 text-white',
}

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div
        className={`${typeStyles[toast.type] || typeStyles.info} px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-3 max-w-sm`}
      >
        <span className="text-sm">{toast.message}</span>
        <button onClick={onDismiss} className="text-white/70 hover:text-white">
          {'\u2715'}
        </button>
      </div>
    </div>
  )
}
