import { useState, type FormEvent } from 'react'
import { apiErrorMessage } from '../client'
import type { WidgetDefinition } from '../dashboard/types'
import { MAX_REFRESH_RATE_SECONDS, MIN_REFRESH_RATE_SECONDS } from '../dashboard/refreshRate'

interface AddWidgetFormProps {
  definition: WidgetDefinition
  onSubmit: (config: Record<string, string | number>, refreshRateSeconds: number) => Promise<void>
  onCancel: () => void
}


function AddWidgetForm({ definition, onSubmit, onCancel }: AddWidgetFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(definition.params.map((param) => [param.key, param.defaultValue ?? ''])),
  )
  const [refreshRate, setRefreshRate] = useState(() => String(definition.defaultRefreshRate))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(event: FormEvent) {
    // Without this the browser would reload the page to "submit" the form.
    event.preventDefault()

    const config: Record<string, string | number> = {}
    for (const param of definition.params) {
      const value = values[param.key].trim()
      // Leave empty fields out: the server fills in defaults and reports missing required ones.
      if (value !== '')
        config[param.key] = param.type === 'INTEGER' ? Number(value) : value
    }

    setIsSubmitting(true)
    setError(null)
    onSubmit(config, Number(refreshRate))
      .catch((err) => {
        setError(apiErrorMessage(err, 'Could not add this widget.'))
        setIsSubmitting(false)
      })
  }

  return (
    <form className="add-widget-form" onSubmit={handleSubmit}>
      <p className="add-widget-form-title">Add {definition.name}</p>

      {definition.params.map((param) => (
        <label key={param.key} className="add-widget-form-field">
          <span>
            {param.label}
            {param.required && ' *'}
          </span>
          <input
            type={param.type === 'INTEGER' ? 'number' : 'text'}
            step={param.type === 'INTEGER' ? 1 : undefined}
            required={param.required}
            value={values[param.key]}
            onChange={(event) => setValues({ ...values, [param.key]: event.target.value })}
          />
        </label>
      ))}

      <label className="add-widget-form-field">
        <span>Refresh every (seconds) *</span>
        <input
          type="number"
          min={MIN_REFRESH_RATE_SECONDS}
          max={MAX_REFRESH_RATE_SECONDS}
          step={1}
          required
          value={refreshRate}
          onChange={(event) => setRefreshRate(event.target.value)}
        />
      </label>

      {error && <p className="add-widget-form-error">{error}</p>}

      <div className="add-widget-form-actions">
        <button type="button" className="add-widget-form-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add widget'}
        </button>
      </div>
    </form>
  )
}

export default AddWidgetForm
