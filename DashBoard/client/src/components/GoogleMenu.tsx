import { useEffect, useId, useRef, useState } from 'react'
import { redirectToGoogleOauth } from '../oauth/googleAuth'
import { fetchWidgetDefinitions } from '../dashboard/api'
import type { WidgetDefinition } from '../dashboard/types'
import AddWidgetForm from './AddWidgetForm'
import './googleMenu.css'

interface GoogleMenuProps {
  onAddWidget?: (
    definition: WidgetDefinition,
    config: Record<string, string | number>,
    refreshRateSeconds: number,
  ) => Promise<void>
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.6 12.23c0-.63-.06-1.24-.17-1.82H12v3.45h5.39a4.6 4.6 0 0 1-2 3.01v2.49h3.24c1.9-1.75 3-4.32 3-7.13Z" fill="#4285F4"/>
      <path d="M12 22c2.7 0 4.96-.9 6.61-2.45l-3.24-2.49c-.9.6-2.05.96-3.37.96-2.59 0-4.79-1.75-5.58-4.1H.9v2.58A10 10 0 0 0 12 22Z" fill="#34A853"/>
      <path d="M6.42 19.88A6 6 0 0 1 6 16.3V13.7H2.66A10 10 0 0 0 2 12c0-1.66.4-3.24 1.1-4.7L6.42 10v9.88Z" fill="#FBBC05"/>
      <path d="M12 4.98c1.48 0 2.8.51 3.84 1.5l2.88-2.88A9.9 9.9 0 0 0 12 2a10 10 0 0 0-9.1 5.3L6.42 10a6 6 0 0 1 5.58-5.02Z" fill="#EA4335"/>
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
