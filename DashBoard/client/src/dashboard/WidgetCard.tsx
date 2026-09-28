import type { useSortable } from '@dnd-kit/sortable'
import type { WidgetInstance } from './types'

type Sortable = ReturnType<typeof useSortable>

interface WidgetCardProps {
  instance: WidgetInstance
  // Passed as separate props rather than one { ref, attributes, listeners }
  // object: the react-hooks/refs lint rule treats an object holding a ref as a
  // ref itself, so reading .attributes from it during render gets flagged.
  handleRef?: Sortable['setActivatorNodeRef']
  handleAttributes?: Sortable['attributes']
  handleListeners?: Sortable['listeners']
}

function WidgetCard({
  instance,
  handleRef,
  handleAttributes,
  handleListeners,
}: WidgetCardProps) {
  return (
    <div className="widget-card">
      <div className="widget-card-header">
        <span className="widget-card-title">
          {instance.widgetDefinition?.name ?? 'Widget'}
        </span>
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
      </div>
      <div className="widget-card-body">
        <p>Widget content coming soon.</p>
      </div>
    </div>
  )
}

export default WidgetCard
