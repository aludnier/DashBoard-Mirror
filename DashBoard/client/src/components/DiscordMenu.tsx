import { useEffect, useId, useRef, useState } from 'react'
import { redirectToDiscordOauth } from '../oauth/discordAuth'
import { fetchWidgetDefinitions } from '../dashboard/api'
import type { WidgetDefinition } from '../dashboard/types'
import AddWidgetForm from './AddWidgetForm'
import './discordMenu.css'

interface DiscordMenuProps {
  onAddWidget?: (definition: WidgetDefinition, config: Record<string, string | number>) => Promise<void>
}

function DiscordMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-discord" viewBox="0 0 16 16">
      <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
    </svg>
  )
}

function DiscordMenu({ onAddWidget }: DiscordMenuProps) {
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
    fetchWidgetDefinitions('discord')
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
      return <p className="discord-menu-status">Loading widgets...</p>

    if (loadError)
      return <p className="discord-menu-status">Could not load widgets. Close and reopen to retry.</p>

    if (!definitions || definitions.length === 0)
      return <p className="discord-menu-status">No Discord widgets available yet.</p>

    return (
      <ul className="discord-menu-widgets">
        {definitions.map((definition) => (
          <li key={definition.id} className="discord-menu-widget">
            <div>
              <p className="discord-menu-widget-name">{definition.name}</p>
              {definition.description && (
                <p className="discord-menu-widget-description">{definition.description}</p>
              )}
            </div>
            {onAddWidget && (
              <button
                type="button"
                className="discord-menu-add"
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
    <div className="discord-menu" ref={containerRef}>
      <button
        type="button"
        className="discord-menu-trigger"
        aria-label="Discord integration"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        <DiscordMark />
      </button>

      {isOpen && (
        <div id={panelId} className="discord-menu-panel" role="dialog" aria-label="Discord integration">
          <button type="button" className="discord-menu-connect" onClick={redirectToDiscordOauth}>
            <DiscordMark />
            Connect with Discord
          </button>

          {!selectedDefinition && <h3 className="discord-menu-heading">Available widgets</h3>}
          {renderWidgets()}
        </div>
      )}
    </div>
  )
}

export default DiscordMenu
