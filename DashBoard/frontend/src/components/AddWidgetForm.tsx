import { useState, type FormEvent } from 'react'
import { apiErrorMessage } from '../client'
import type { WidgetDefinition } from '../dashboard/types'
import { MAX_REFRESH_RATE_SECONDS, MIN_REFRESH_RATE_SECONDS } from '../dashboard/refreshRate'

interface AddWidgetFormProps {
  definition: WidgetDefinition
  onSubmit: (config: Record<string, string | number | boolean>, refreshRateSeconds: number) => Promise<void>
  onCancel: () => void
}

function AddWidgetForm({ definition, onSubmit, onCancel }: AddWidgetFormProps) {
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(
      definition.params.map((param) => {
        if (param.type === 'BOOLEAN') {
          return [param.key, param.defaultValue === 'true']
        }
        return [param.key, param.defaultValue ?? '']
      }),
    ),
  )
  const [refreshRate, setRefreshRate] = useState(() => String(definition.defaultRefreshRate))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(event: FormEvent) {
    // Without this the browser would reload the page to "submit" the form.
    event.preventDefault()

    const config: Record<string, string | number | boolean> = {}
    for (const param of definition.params) {
      const value = values[param.key]

      if (param.type === 'BOOLEAN') {
        config[param.key] = Boolean(value)
      } else if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed !== '') {
          config[param.key] = param.type === 'INTEGER' ? Number(trimmed) : trimmed
        }
      }
    }

    setIsSubmitting(true)
    setError(null)
    onSubmit(config, Number(refreshRate))
      .catch((err) => {
        setError(apiErrorMessage(err, 'Could not add this widget.'))
        setIsSubmitting(false)
      })
  }

  function renderParamField(param: any) {
    const value = values[param.key]

    switch (param.type) {
      case 'INTEGER':
        return (
          <input
            type="number"
            step={1}
            required={param.required}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => setValues({ ...values, [param.key]: event.target.value })}
          />
        )

      case 'BOOLEAN':
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => setValues({ ...values, [param.key]: event.target.checked })}
          />
        )

      case 'ENUM':
        const options = param.defaultValue?.split(',').map((o: string) => o.trim()) ?? []
        return (
          <select
            required={param.required}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => setValues({ ...values, [param.key]: event.target.value })}
          >
            {options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

        default:
        return (
          <input
            type="text"
            required={param.required}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => setValues({ ...values, [param.key]: event.target.value })}
          />
        )
    }
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
          {renderParamField(param)}
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
