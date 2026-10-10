import { useState, type FormEvent } from "react"
import type { WidgetInstance } from "./types"
import './widgetConfigForm.css'

export type ConfigValue = string | number | boolean

type WidgetConfigProps = {
    widgetName: string
    instance: WidgetInstance
    onSubmit: (config: Record<string, ConfigValue>) => void
    onCancel: () => void
}

function WidgetConfigForm({ widgetName, instance, onSubmit, onCancel} : WidgetConfigProps) {
      const [configValues, setConfigValues] = useState<Record<string, ConfigValue>>(() =>
        Object.fromEntries(
          Object.entries(instance.config).map(([key, value]) => [
            key,
            typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
              ? value
              : JSON.stringify(value) ?? '',
          ]),
        ),
      )
      const [configDraft, setConfigDraft] = useState(configValues)


    function handleConfigSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      setConfigValues(configDraft)
      onSubmit(configDraft)
    }

    return (
      <form className="widget-config-form" onSubmit={handleConfigSubmit}>
        <h2 className="widget-config-title">Configure {widgetName}</h2>
        {Object.keys(configDraft).length === 0 ? (
            <p className="widget-config-empty">This widget has no configurable options.</p>
        ) : (
            Object.entries(configDraft).map(([key, value]) => (
            <label key={key} className="widget-config-field">
                <span>{key}</span>
                {typeof value === 'boolean' ? (
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) => setConfigDraft({ ...configDraft, [key]: event.target.checked })}
                />
                ) : (
                <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    step={typeof value === 'number' ? 'any' : undefined}
                    value={value}
                    onChange={(event) => {
                    const nextValue = typeof value === 'number' && event.target.value !== ''
                        ? Number(event.target.value)
                        : event.target.value
                    setConfigDraft({ ...configDraft, [key]: nextValue })
                    }}
                />
                )}
            </label>
            ))
        )}
        <div className="widget-config-actions">
            <button type="button" onClick={onCancel}>
            Cancel
            </button>
            <button type="submit">Save changes</button>
        </div>
      </form>

    )
}

export default WidgetConfigForm
