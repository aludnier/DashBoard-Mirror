import { useState, type FormEvent } from 'react'
import { apiErrorMessage } from '../client'
import type { WidgetDefinition } from '../dashboard/types'

interface AddWidgetFormProps {
  definition: WidgetDefinition
  // Rejects with the server's error, which the form then shows.
  onSubmit: (config: Record<string, string | number>) => Promise<void>
  onCancel: () => void
}

// Builds one input per WidgetParam, so any widget type gets a form without
// widget-specific code.
function AddWidgetForm({ definition, onSubmit, onCancel }: AddWidgetFormProps) {
  // Inputs always hold strings; they're converted when submitting.
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(definition.params.map((param) => [param.key, param.defaultValue ?? ''])),
  )
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
    onSubmit(config)
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
