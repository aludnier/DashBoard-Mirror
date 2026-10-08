import type { useSortable } from '@dnd-kit/sortable'
import type { WidgetInstance } from './types'
import WidgetContent from './WidgetContent'
import RefreshRateControl from './RefreshRateControl'
import { useState } from 'react'

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
}


function WidgetCard({ instance, onRefreshRateChange, onRemove, handleRef, handleAttributes, handleListeners }: WidgetCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const name = instance.widgetDefinition?.name ?? 'Widget'

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
            ✕
          </button>
        )}
      </div>
      <div className="widget-card-body">
        <WidgetContent instance={instance} />
      </div>
    </div>
  )
}

export default WidgetCard
