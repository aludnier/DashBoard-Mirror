import { useCallback, useEffect, useMemo, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import type { Layout, LayoutItem } from 'react-grid-layout/legacy'
import 'react-grid-layout/css/styles.css'
import { fetchWidgetInstances } from './api'
import type { WidgetInstance } from './types'
import WidgetCard from './WidgetCard'
import EmptyState from './EmptyState'
import './dashboardStyle.css'

// WidthProvider measures the container with a ResizeObserver and feeds the
// result to Responsive as a `width` prop, which is what makes the grid reflow
// when the window (or a sidebar) resizes instead of needing a fixed width.
const ResponsiveGridLayout = WidthProvider(Responsive)

// Breakpoints are compared against the grid container's width, not the
// viewport, so page padding eats into them. "sm" starts at 600 so a portrait
// tablet (768px viewport minus padding) still gets the 6-column layout, and
// everything narrower than that is a phone ("xs").
const BREAKPOINTS = { lg: 1200, md: 996, sm: 600, xs: 0 }
const COLS = { lg: 12, md: 10, sm: 6, xs: 2 }
const PHONE_BREAKPOINT = 'xs'

function instanceToLayoutItem(instance: WidgetInstance): LayoutItem {
  return {
    i: instance.id,
    x: instance.positionX,
    y: instance.positionY,
    w: instance.width,
    h: instance.height,
    minW: 2,
    minH: 2,
  }
}

// On phones every widget takes the full width and they're stacked in the same
// reading order as the desktop grid (top-to-bottom, then left-to-right), rather
// than letting RGL squeeze the lg layout into 2 columns, which can put two
// narrow widgets side by side.
function buildPhoneLayout(instances: WidgetInstance[]): LayoutItem[] {
  const ordered = [...instances].sort(
    (a, b) => a.positionY - b.positionY || a.positionX - b.positionX,
  )
  let y = 0
  return ordered.map((instance) => {
    const item = { i: instance.id, x: 0, y, w: COLS.xs, h: instance.height }
    y += instance.height
    return item
  })
}

function Dashboard() {
  const [instances, setInstances] = useState<WidgetInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // WidthProvider always renders once at 1280px before measuring, so "lg" is
  // the correct starting value; onBreakpointChange fires as soon as the real
  // width is known.
  const [breakpoint, setBreakpoint] = useState('lg')
  const isPhone = breakpoint === PHONE_BREAKPOINT

  useEffect(() => {
    let cancelled = false

    fetchWidgetInstances()
      .then((data) => {
        if (!cancelled)
          setInstances(data)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load your dashboard. Please try again later.')
        }
      })
      .finally(() => {
        if (!cancelled)
          setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Only "lg" is derived from stored positions; RGL auto-generates md/sm from
  // it by reflowing items into fewer columns, since the backend only keeps a
  // single canonical position per widget instance (not one per breakpoint).
  const layouts = useMemo(
    () => ({
      lg: instances.map(instanceToLayoutItem),
      xs: buildPhoneLayout(instances),
    }),
    [instances],
  )

  // Fired only when the user actually releases a drag, unlike onLayoutChange,
  // which also fires on every breakpoint reflow and would overwrite the
  // canonical position with a scaled-down md/sm one.
  const handleDragStop = useCallback((_layout: Layout, _oldItem: LayoutItem | null, newItem: LayoutItem | null) => {
    if (!newItem)
      return
    setInstances((prev) =>
      prev.map((instance) =>
        instance.id === newItem.i
          ? { ...instance, positionX: newItem.x, positionY: newItem.y }
          : instance,
      ),
    )
    // TODO(#11): persist the new position, e.g.
    // updateWidgetInstancePosition(newItem.i, { positionX: newItem.x, positionY: newItem.y, width: newItem.w, height: newItem.h })
  }, [])

  const handleResizeStop = useCallback((_layout: Layout, _oldItem: LayoutItem | null, newItem: LayoutItem | null) => {
    if (!newItem) return
    setInstances((prev) =>
      prev.map((instance) =>
        instance.id === newItem.i
          ? { ...instance, width: newItem.w, height: newItem.h }
          : instance,
      ),
    )
    // TODO(#11): persist the new size alongside the position update above.
  }, [])

  if (isLoading) {
    return <div className="dashboard-status">Loading your dashboard...</div>
  }

  if (error) {
    return <div className="dashboard-status dashboard-status-error">{error}</div>
  }

  if (instances.length === 0) {
    return <EmptyState />
  }

  return (
    <div className={isPhone ? 'dashboard-page dashboard-page-phone' : 'dashboard-page'}>
      <ResponsiveGridLayout
        className="dashboard-grid"
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={120}
        margin={isPhone ? [12, 12] : [16, 16]}
        onBreakpointChange={(newBreakpoint) => setBreakpoint(newBreakpoint)}
        // Editing is off on phones: a touch drag on the header would fight
        // with page scrolling, and a position from the 2-column phone layout
        // would overwrite the canonical 12-column one if it were saved.
        isDraggable={!isPhone}
        isResizable={!isPhone}
        draggableHandle=".drag-handle"
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
      >
        {instances.map((instance) => (
          <div key={instance.id}>
            <WidgetCard instance={instance} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  )
}

export default Dashboard
