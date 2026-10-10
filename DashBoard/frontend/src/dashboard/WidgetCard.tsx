import type { useSortable } from '@dnd-kit/sortable'
import type { WidgetInstance } from './types'
import WidgetContent from './WidgetContent'
import RefreshRateControl from './RefreshRateControl'
import { useRef, useState} from 'react'
import WidgetConfigForm, { type ConfigValue } from './widgetConfigForm'
import { updateWidgetInstance } from './api'

type Sortable = ReturnType<typeof useSortable>

interface WidgetCardProps {
  instance: WidgetInstance
  // Passed as separate props rather than one { ref, attributes, listeners }
  // object: the react-hooks/refs lint rule treats an object holding a ref as a
  // ref itself, so reading .attributes from it during render gets flagged.
  onRefreshRateChange?: (seconds: number) => Promise<void>
  onRemove?: () => Promise<void>
  handleRef?: Sortable['setActivatorNodeRef']
  handleAttributes?: Sortable['attributes']
  handleListeners?: Sortable['listeners']
  onResize: (e: React.PointerEvent) =>  void
}


function WidgetCard({ instance, onRefreshRateChange, onRemove, handleRef, handleAttributes, handleListeners, onResize }: WidgetCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const name = instance.widgetDefinition?.name ?? 'Widget'

  function openConfigMenu() {
    if (menuRef.current?.matches(':popover-open')) {
      menuRef.current.hidePopover()
      return
    }
  
    menuRef.current?.showPopover()
  }

  function onConfigSubmit(configDraft : Record<string, ConfigValue> ) {
      updateWidgetInstance(instance.id, {
        refreshRate: instance.refreshRateSeconds,
        height: instance.height,
        width: instance.width,
        position: instance.position,
        config: configDraft
      })
      menuRef.current?.hidePopover()

  }

  async function handleRemove() {
    if (!onRemove)
      return
    setIsRemoving(true)
    try {
      await onRemove()
    } catch {
      window.alert('Could not remove the widget. Please try again.')
      setIsRemoving(false)
    }
  }

  return (
    <div className="widget-card">
      <div className="widget-card-header">
        <span className="widget-card-title">
          {instance.widgetDefinition?.name ?? 'Widget'}
        </span>
        {onRefreshRateChange && (
          <RefreshRateControl seconds={instance.refreshRateSeconds} onChange={onRefreshRateChange} />
        )}
        <button
          type="button"
          className="widget-card-configure"
          aria-label={`Configure ${name}`}
          title={`Configure ${name}`}
          aria-expanded={isConfigOpen}
          aria-controls={`widget-config-${instance.id}`}
          onClick={openConfigMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg>
        </button>
        <div
          ref={menuRef}
          id={`widget-config-${instance.id}`}
          className="widget-config-popover"
          popover="auto"
          onToggle={(event) => setIsConfigOpen(event.currentTarget.matches(':popover-open'))}
        >
          <WidgetConfigForm
            widgetName={name}
            instance={instance}
            onSubmit={onConfigSubmit}
            onCancel={() => menuRef.current?.hidePopover()}
          />
        </div>
        {handleAttributes && (
          <button
            type="button"
            className="widget-card-handle"
            aria-label="Drag to reorder"
            ref={handleRef}
            {...handleAttributes}
            {...handleListeners}
          >
            ⠿
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            className="widget-card-remove"
            aria-label={`Remove ${name}`}
            onClick={handleRemove}
            disabled={isRemoving}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </button>
        )}
      </div>
      <div className="widget-card-body">
        <WidgetContent instance={instance} />
      </div>
      <div className="widget-card-resizeButton" onPointerDown={onResize}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-angle-expand" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707"/>
        </svg>
      </div>
    </div>
  )
}

export default WidgetCard
