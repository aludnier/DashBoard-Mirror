import { useCallback, useEffect, useMemo, useState } from 'react'
import { Responsive, getBreakpointFromWidth, useContainerWidth } from 'react-grid-layout'
import type { EventCallback, LayoutItem } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { fetchWidgetInstances } from './api'
import type { WidgetInstance } from './types'
import WidgetCard from './WidgetCard'
import EmptyState from './EmptyState'
import './dashboardStyle.css'

// Breakpoints are compared against the grid container's width, not the
// viewport, so page padding eats into them. "sm" starts at 600 so a portrait
// tablet (768px viewport minus padding) still gets the 6-column layout, and
// everything narrower than that is a phone ("xs").
const BREAKPOINTS = { lg: 1200, md: 996, sm: 600, xs: 0 }
const COLS = { lg: 12, md: 10, sm: 6, xs: 2 }
const MARGINS = { lg: [16, 16], md: [16, 16], sm: [16, 16], xs: [12, 12] } as const
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

type DashboardGridProps = {
  instances: WidgetInstance[]
  onDragStop: EventCallback
  onResizeStop: EventCallback
}

// Split out from Dashboard so useContainerWidth only mounts once the grid's
// container div exists. The hook attaches its ResizeObserver in a mount effect; if it lived
// in Dashboard, that effect would run while the loading message is showing,
// find no element, and never re-run, so the grid would never appear.
function DashboardGrid({ instances, onDragStop, onResizeStop }: DashboardGridProps) {
  // measureBeforeMount keeps `mounted` false until the real width is known, so
  // the grid never renders once at the hook's 1280px default.
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true })
  // Derived from the same width with the same helper Responsive uses
  // internally, so it always agrees with the layout RGL is rendering.
  const isPhone = getBreakpointFromWidth(BREAKPOINTS, width) === PHONE_BREAKPOINT

  // Only "lg" and "xs" are provided; RGL auto-generates md/sm from lg by
  // reflowing items into fewer columns, since the backend only keeps a single
  // canonical position per widget instance (not one per breakpoint).
  const layouts = useMemo(
    () => ({
      lg: instances.map(instanceToLayoutItem),
      xs: buildPhoneLayout(instances),
    }),
    [instances],
  )

  return (
    <div ref={containerRef} className={isPhone ? 'dashboard-grid-phone' : undefined}>
      {mounted && (
        <Responsive
          className="dashboard-grid"
          width={width}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={120}
          margin={MARGINS}
          // Editing is off on phones: a touch drag on the header would fight
          // with page scrolling, and a position from the 2-column phone layout
          // would overwrite the canonical 12-column one if it were saved.
          dragConfig={{ enabled: !isPhone, handle: '.drag-handle' }}
          resizeConfig={{ enabled: !isPhone }}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        >
          {instances.map((instance) => (
            <div key={instance.id}>
              <WidgetCard instance={instance} />
            </div>
          ))}
        </Responsive>
      )}
    </div>
  )
}

function Dashboard() {
  const [instances, setInstances] = useState<WidgetInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

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

  // Fired only when the user actually releases a drag, unlike onLayoutChange,
  // which also fires on every breakpoint reflow and would overwrite the
  // canonical position with a scaled-down md/sm one.
  const handleDragStop = useCallback<EventCallback>((_layout, _oldItem, newItem) => {
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

  const handleResizeStop = useCallback<EventCallback>((_layout, _oldItem, newItem) => {
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

  function handleLogout() {
    // TODO: clear the session (token, user) once auth is wired up.
    // `replace` swaps the dashboard out of the history stack, so the browser's
    // back button doesn't lead straight back into it after logging out.
    navigate('/', { replace: true })
  }

  function renderContent() {
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
      <DashboardGrid
        instances={instances}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
      />
    )
  }

  return (
    <div className="dashboard-layout">
      <NavBar brandTo="/dashboard">
        <button type="button" onClick={handleLogout}>Log out</button>
      </NavBar>
      <main className="dashboard-page">{renderContent()}</main>
    </div>
  )
}

export default Dashboard
