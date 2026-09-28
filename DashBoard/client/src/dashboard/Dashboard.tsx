import { useEffect, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { fetchWidgetInstances } from './api'
import type { WidgetInstance } from './types'
import { nextSize } from './sizes'
import SortableWidget from './SortableWidget'
import EmptyState from './EmptyState'
import './dashboardStyle.css'

type DashboardGridProps = {
  instances: WidgetInstance[]
  onReorder: (activeId: string, overId: string) => void
  onCycleSize: (id: string) => void
}

function DashboardGrid({ instances, onReorder, onCycleSize }: DashboardGridProps) {
  const sensors = useSensors(
    // A 5px threshold so a plain click on the handle doesn't count as a drag.
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Long-press on touch, so a normal swipe over the handle still scrolls the page.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    // Tab to a handle, Space to pick up, arrow keys to move, Space to drop.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id)
      onReorder(String(active.id), String(over.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {/* Items must be in the same order as they're rendered below. */}
      <SortableContext items={instances} strategy={rectSortingStrategy}>
        <div className="dashboard-grid">
          {instances.map((instance) => (
            <SortableWidget
              key={instance.id}
              instance={instance}
              onCycleSize={() => onCycleSize(instance.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
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
          setInstances([...data].sort((a, b) => a.position - b.position))
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

  function handleReorder(activeId: string, overId: string) {
    const oldIndex = instances.findIndex((instance) => instance.id === activeId)
    const newIndex = instances.findIndex((instance) => instance.id === overId)
    const reordered = arrayMove(instances, oldIndex, newIndex)
      .map((instance, index) => ({ ...instance, position: index }))
    setInstances(reordered)
    // TODO(#11): saveWidgetOrder(reordered.map((instance) => instance.id))
  }

  function handleCycleSize(id: string) {
    const target = instances.find((instance) => instance.id === id)
    if (!target)
      return
    const size = nextSize(target)
    setInstances((prev) =>
      prev.map((instance) => (instance.id === id ? { ...instance, ...size } : instance)),
    )
    // TODO(#11): updateWidgetInstanceSize(id, size)
  }

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
        onReorder={handleReorder}
        onCycleSize={handleCycleSize}
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
