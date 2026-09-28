import { useEffect, useId, useRef, useState } from 'react'
import { redirectToGithubOauth } from '../oauth/github'
import { fetchWidgetDefinitions } from '../dashboard/api'
import type { WidgetDefinition } from '../dashboard/types'
import AddWidgetForm from './AddWidgetForm'
import './githubMenu.css'

interface GithubMenuProps {
  // Without it, the list is a preview with no "Add" buttons. Should reject
  // with the server's error so the form can show it.
  onAddWidget?: (definition: WidgetDefinition, config: Record<string, string | number>) => Promise<void>
}

function GithubMark() {
  // Official GitHub mark, inlined so it follows `color` via currentColor.
  return (
    <svg viewBox="0 0 16 16" width="22" height="22" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function GithubMenu({ onAddWidget }: GithubMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const [definitions, setDefinitions] = useState<WidgetDefinition[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(false)
  // The widget whose settings form is showing; null shows the list.
  const [selectedDefinition, setSelectedDefinition] = useState<WidgetDefinition | null>(null)

  // Only listen while open: close on a click outside the menu or on Escape.
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
    fetchWidgetDefinitions('github')
      .then(setDefinitions)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoadingDefinitions(false))
  }

  function handleToggle() {
    const willOpen = !isOpen
    setIsOpen(willOpen)
    // Reopening always starts from the list, not a half-filled form.
    setSelectedDefinition(null)
    // Fetch on the first open (or retry after an error), from the click
    // handler rather than an effect: the click is what causes the request.
    if (willOpen && definitions === null && !isLoadingDefinitions)
      loadDefinitions()
  }

  function renderWidgets() {
    if (selectedDefinition && onAddWidget) {
      return (
        <AddWidgetForm
          // A new key per widget type resets the form's state when switching.
          key={selectedDefinition.id}
          definition={selectedDefinition}
          onSubmit={async (config) => {
            await onAddWidget(selectedDefinition, config)
            setSelectedDefinition(null)
            setIsOpen(false)
          }}
          onCancel={() => setSelectedDefinition(null)}
        />
      )
    }

    if (isLoadingDefinitions)
      return <p className="github-menu-status">Loading widgets...</p>

    if (loadError)
      return <p className="github-menu-status">Could not load widgets. Close and reopen to retry.</p>

    if (!definitions || definitions.length === 0)
      return <p className="github-menu-status">No GitHub widgets available yet.</p>

    return (
      <ul className="github-menu-widgets">
        {definitions.map((definition) => (
          <li key={definition.id} className="github-menu-widget">
            <div>
              <p className="github-menu-widget-name">{definition.name}</p>
              {definition.description && (
                <p className="github-menu-widget-description">{definition.description}</p>
              )}
            </div>
            {onAddWidget && (
              <button
                type="button"
                className="github-menu-add"
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
    <div className="github-menu" ref={containerRef}>
      <button
        type="button"
        className="github-menu-trigger"
        aria-label="GitHub integration"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        <GithubMark />
      </button>

      {isOpen && (
        <div id={panelId} className="github-menu-panel" role="dialog" aria-label="GitHub integration">
          <button type="button" className="github-menu-connect" onClick={redirectToGithubOauth}>
            <GithubMark />
            Connect with Github
          </button>

          {!selectedDefinition && <h3 className="github-menu-heading">Available widgets</h3>}
          {renderWidgets()}
        </div>
      )}
    </div>
  )
}

export default GithubMenu
