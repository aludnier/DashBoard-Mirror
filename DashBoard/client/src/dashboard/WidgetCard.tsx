import type { useSortable } from '@dnd-kit/sortable'
import type { WidgetInstance } from './types'
import { sizeLabel } from './sizes'

type Sortable = ReturnType<typeof useSortable>

interface WidgetCardProps {
  instance: WidgetInstance
  dragHandle?: {
    ref: Sortable['setActivatorNodeRef']
    attributes: Sortable['attributes']
    listeners: Sortable['listeners']
  }
  onCycleSize?: () => void
}

function WidgetCard({ instance, dragHandle, onCycleSize }: WidgetCardProps) {
  return (
    <div className="widget-card">
      <div className="widget-card-header">
        <span className="widget-card-title">
          {instance.widgetDefinition?.name ?? 'Widget'}
        </span>
        {onCycleSize && (
          <button type="button" className="widget-card-size" onClick={onCycleSize} title="Change size">
            {sizeLabel(instance)}
          </button>
        )}
        {dragHandle && (
          <button
            type="button"
            className="widget-card-handle"
            aria-label="Drag to reorder"
            ref={dragHandle.ref}
            {...dragHandle.attributes}
            {...dragHandle.listeners}
          >
            ⠿
          </button>
        )}
      </div>
      <div className="widget-card-body">
        <p>Widget content coming soon.</p>
      </div>
    </div>
  )
}

export default WidgetCard
