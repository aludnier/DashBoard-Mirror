import { useEffect, useId, useRef, useState } from 'react'
import { redirectToGoogleOauth } from '../oauth/googleAuth'
import { fetchWidgetDefinitions } from '../dashboard/api'
import type { WidgetDefinition } from '../dashboard/types'
import AddWidgetForm from './AddWidgetForm'
import './googleMenu.css'

interface GoogleMenuProps {
  onAddWidget?: (
    definition: WidgetDefinition,
    config: Record<string, string | number | boolean>,
    refreshRateSeconds: number,
  ) => Promise<void>
}

function GoogleMark() {
  return (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
  </svg>
)
}

function GoogleMenu({ onAddWidget }: GoogleMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const [definitions, setDefinitions] = useState<WidgetDefinition[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(false)
  const [selectedDefinition, setSelectedDefinition] = useState<WidgetDefinition | null>(null)

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
    fetchWidgetDefinitions('google')
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
      return <p className="google-menu-status">Loading widgets...</p>

    if (loadError)
      return <p className="google-menu-status">Could not load widgets. Close and reopen to retry.</p>

    if (!definitions || definitions.length === 0)
      return <p className="google-menu-status">No Google widgets available yet.</p>

    return (
      <ul className="google-menu-widgets">
        {definitions.map((definition) => (
          <li key={definition.id} className="google-menu-widget">
            <div>
              <p className="google-menu-widget-name">{definition.name}</p>
              {definition.description && (
                <p className="google-menu-widget-description">{definition.description}</p>
              )}
            </div>
            {onAddWidget && (
              <button
                type="button"
                className="google-menu-add"
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
    <div className="google-menu" ref={containerRef}>
      <button
        type="button"
        className="google-menu-trigger"
        aria-label="Google integration"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        <GoogleMark />
      </button>

      {isOpen && (
        <div id={panelId} className="google-menu-panel" role="dialog" aria-label="Google integration">
          <button type="button" className="google-menu-connect" onClick={redirectToGoogleOauth}>
            <GoogleMark />
            Connect with Google
          </button>

          {!selectedDefinition && <h3 className="google-menu-heading">Available widgets</h3>}
          {renderWidgets()}
        </div>
      )}
    </div>
  )
}

export default GoogleMenu
