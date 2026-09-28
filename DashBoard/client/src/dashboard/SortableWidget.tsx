import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { WidgetInstance } from './types'
import WidgetCard from './WidgetCard'

interface SortableWidgetProps {
  instance: WidgetInstance
}

function SortableWidget({ instance }: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: instance.id })

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
        handleRef={setActivatorNodeRef}
        handleAttributes={attributes}
        handleListeners={listeners}
      />
    </div>
  )
}

export default SortableWidget
