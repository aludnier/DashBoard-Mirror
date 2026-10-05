import { useState, type FormEvent } from 'react'
import { apiErrorMessage } from '../client'
import { MAX_REFRESH_RATE_SECONDS, MIN_REFRESH_RATE_SECONDS } from './refreshRate'

interface RefreshRateControlProps {
  seconds: number
  onChange: (seconds: number) => Promise<void>
}

function RefreshRateControl({ seconds, onChange }: RefreshRateControlProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function close() {
    setDraft(null)
    setError(null)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (draft === null) return

    const next = Number(draft)
    if (next === seconds) {
      close()
      return
    }

    setIsSaving(true)
    setError(null)
    onChange(next)
      .then(close)
      .catch((err) => setError(apiErrorMessage(err, 'Could not save the refresh rate.')))
      .finally(() => setIsSaving(false))
  }

  if (draft === null) {
    return (
      <button
        type="button"
        className="widget-refresh-button"
        title="Change refresh rate"
        onClick={() => setDraft(String(seconds))}
      >
        ⟳ {seconds}s
      </button>
    )
  }

  return (
    <form className="widget-refresh-form" onSubmit={handleSubmit}>
      <input
        type="number"
        aria-label="Refresh every (seconds)"
        min={MIN_REFRESH_RATE_SECONDS}
        max={MAX_REFRESH_RATE_SECONDS}
        step={1}
        required
        autoFocus
        disabled={isSaving}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close()
        }}
      />
      <button type="submit" disabled={isSaving}>
        {isSaving ? '...' : 'Save'}
      </button>
      <button type="button" aria-label="Cancel" onClick={close}>
        ✕
      </button>
      {error && <p className="widget-refresh-error">{error}</p>}
    </form>
  )
}

export default RefreshRateControl
