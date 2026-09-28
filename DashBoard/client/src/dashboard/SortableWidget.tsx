import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { WidgetInstance } from './types'
import WidgetCard from './WidgetCard'

interface SortableWidgetProps {
  instance: WidgetInstance
  onCycleSize: () => void
}

function SortableWidget({ instance, onCycleSize }: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: instance.id })

  const style = {
    // Spans are read by the CSS. --w-md is precomputed because a 4-wide widget
    // must not span 4 columns once the tablet grid only has 2.
    '--w': instance.width,
    '--w-md': Math.min(instance.width, 2),
    '--h': instance.height,
    // Translate, not Transform: with mixed widget sizes, CSS.Transform also
    // scales the item to match the one it's swapping with, which stretches the card.
    transform: CSS.Translate.toString(transform),
    transition,
  } as CSSProperties

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'dashboard-grid-item is-dragging' : 'dashboard-grid-item'}
    >
      <WidgetCard
        instance={instance}
        dragHandle={{ ref: setActivatorNodeRef, attributes, listeners }}
        onCycleSize={onCycleSize}
      />
    </div>
  )
}

export default SortableWidget
