import { useState } from 'react'
import { validateToken } from '../lib/github'
import { REPO_OWNER, REPO_NAME, STORAGE_KEYS } from '../lib/constants'

export default function TokenSetup({ onSave, onClose }) {
  const [token, setToken] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState(null)
  const hasExistingToken = Boolean(localStorage.getItem(STORAGE_KEYS.token))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidating(true)
    setError(null)

    const valid = await validateToken(token.trim(), REPO_OWNER, REPO_NAME)
    setValidating(false)

    if (valid) {
      localStorage.setItem(STORAGE_KEYS.token, token.trim())
      onSave(token.trim())
    } else {
      setError('Token is invalid or does not have write access to this repo.')
    }
  }

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEYS.token)
    onSave(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-glass rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold mb-2">GitHub Token Setup</h2>
        <p className="text-sm text-text-secondary mb-4">
          Create a <span className="text-accent">Personal Access Token</span> with{' '}
          <code className="text-xs bg-bg-glass px-1 py-0.5 rounded">repo</code> scope
          (or <code className="text-xs bg-bg-glass px-1 py-0.5 rounded">public_repo</code> for public repos).
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full bg-bg-primary border border-border-glass rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent mb-3"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex items-center justify-between">
            <div>
              {hasExistingToken && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  Clear Token
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
                disabled={!token.trim() || validating}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-xl text-sm text-white transition-colors disabled:opacity-40"
              >
                {validating ? 'Validating...' : 'Save Token'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
