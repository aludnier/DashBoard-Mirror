import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import type { AnimateLayoutChanges } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { WidgetInstance } from './types'
import WidgetCard from './WidgetCard'

interface SortableWidgetProps {
  instance: WidgetInstance
  onRefreshRateChange: (seconds: number) => Promise<void>
  onRemove: () => Promise<void>
  onResize: (id: string, width: number, height: number) => void
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

function SortableWidget({ instance, onRefreshRateChange, onRemove, onResize }: SortableWidgetProps) {
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
    gridColumn: `span ${instance.width}`,
    gridRow: `span ${instance.height}`,
  }


  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const CELL_H = 10

    const grid = (e.currentTarget as HTMLElement).closest('.dashboard-grid') as HTMLElement
    const styles = getComputedStyle(grid)
    const tracks = styles.gridTemplateColumns.split(' ').map(parseFloat)
    const colCount = tracks.length
    const gap = parseFloat(styles.columnGap) || 0
    const CELL_W = tracks[0] + gap

    const startX = e.clientX
    const startY = e.clientY

    const resizing = (ev: PointerEvent) => {
      const dCols = Math.round((ev.clientX - startX) / CELL_W)
      const dRows = Math.round((ev.clientY - startY) / CELL_H)

      onResize(
        instance.id,
        Math.min(colCount, Math.max(1, instance.width + dCols)),
        Math.max(2, instance.height + dRows),
      )
    }

    const pointerUp = () => {
      window.removeEventListener('pointermove', resizing)
      window.removeEventListener('pointerup', pointerUp)
    }

    window.addEventListener('pointermove', resizing)
    window.addEventListener('pointerup', pointerUp)
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
      <div className="" onPointerDown={startResize}>test </div>
    </div>
  )
}

export default SortableWidget
