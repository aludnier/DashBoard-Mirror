import { useEffect, useId, useRef, useState } from 'react'
import type { WidgetDefinition } from '../dashboard/types'
import AddWidgetForm from './AddWidgetForm'
import './providerMenu.css'

export interface ProviderMenuProps {
  label: string
  triggerLabel: string
  fetchDefinitions: () => Promise<WidgetDefinition[]>
  onConnect: () => void
  renderTriggerIcon: () => React.ReactNode
  onAddWidget?: (
    definition: WidgetDefinition,
    config: Record<string, string | number | boolean>,
    refreshRateSeconds: number,
  ) => Promise<void>
}

function ProviderMenu({
  label,
  triggerLabel,
  fetchDefinitions,
  onConnect,
  renderTriggerIcon,
  onAddWidget,
}: ProviderMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [definitions, setDefinitions] = useState<WidgetDefinition[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(false)
  const [selectedDefinition, setSelectedDefinition] = useState<WidgetDefinition | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape')
        setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function loadDefinitions() {
    setIsLoadingDefinitions(true)
    setLoadError(false)
    fetchDefinitions()
      .then(setDefinitions)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoadingDefinitions(false))
  }

  function handleToggle() {
    const willOpen = !isOpen
    setIsOpen(willOpen)
    setSelectedDefinition(null)
    if (willOpen && definitions === null && !isLoadingDefinitions)
      loadDefinitions()
  }

  function renderWidgets() {
    if (selectedDefinition && onAddWidget) {
      return (
        <AddWidgetForm
          key={selectedDefinition.id}
          definition={selectedDefinition}
          onSubmit={async (config, refreshRateSeconds) => {
            await onAddWidget(selectedDefinition, config, refreshRateSeconds)
            setSelectedDefinition(null)
            setIsOpen(false)
          }}
          onCancel={() => setSelectedDefinition(null)}
        />
      )
    }

    if (isLoadingDefinitions)
      return <p className="provider-menu-status">Loading widgets...</p>

    if (loadError)
      return <p className="provider-menu-status">Could not load widgets. Close and reopen to retry.</p>

    if (!definitions || definitions.length === 0)
      return <p className="provider-menu-status">No widgets available yet.</p>

    return (
      <ul className="provider-menu-widgets">
        {definitions.map((definition) => (
          <li key={definition.id} className="provider-menu-widget">
            <div>
              <p className="provider-menu-widget-name">{definition.name}</p>
              {definition.description && (
                <p className="provider-menu-widget-description">{definition.description}</p>
              )}
            </div>
            {onAddWidget && (
              <button
                type="button"
                className="provider-menu-add"
                onClick={() => setSelectedDefinition(definition)}
              >
                Add
              </button>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="provider-menu" ref={containerRef}>
      <button
        type="button"
        className="provider-menu-trigger"
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        {renderTriggerIcon()}
      </button>

      {isOpen && (
        <div id={panelId} className="provider-menu-panel" role="dialog" aria-label={label}>
          <button type="button" className="provider-menu-connect" onClick={onConnect}>
            {renderTriggerIcon()}
            {triggerLabel}
          </button>

          {!selectedDefinition && <h3 className="provider-menu-heading">Available widgets</h3>}
          {renderWidgets()}
        </div>
      )}
    </div>
  )
}

export default ProviderMenu
