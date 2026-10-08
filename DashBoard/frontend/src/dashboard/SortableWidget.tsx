import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import type { AnimateLayoutChanges } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { WidgetInstance } from './types'
import WidgetCard from './WidgetCard'

interface SortableWidgetProps {
  instance: WidgetInstance
  onRefreshRateChange: (seconds: number) => Promise<void>
  onRemove: () => Promise<void>
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

function SortableWidget({ instance, onRefreshRateChange, onRemove }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } =
    useSortable({ id: instance.id, animateLayoutChanges })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'dashboard-grid-item is-dragging' : 'dashboard-grid-item'}
    >
      <WidgetCard
        instance={instance}
        onRefreshRateChange={onRefreshRateChange}
        onRemove={onRemove}
        handleRef={setActivatorNodeRef}
        handleAttributes={attributes}
        handleListeners={listeners}
      />
    </div>
  )
}

export default SortableWidget
