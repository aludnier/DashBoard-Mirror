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
import { Navigate, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import GithubMenu from '../components/GithubMenu'
import GoogleMenu from '../components/GoogleMenu'
import DiscordMenu from '../components/DiscordMenu'
import { getUserSession } from '../client'
import { createWidgetInstance, fetchWidgetInstances, updateWidgetRefreshRate } from './api'
import type { WidgetDefinition, WidgetInstance } from './types'
import SortableWidget from './SortableWidget'
import EmptyState from './EmptyState'
import './dashboardStyle.css'
import ThemeButton from '../components/darkThemeButton'

type DashboardGridProps = {
  instances: WidgetInstance[]
  onReorder: (activeId: string, overId: string) => void
  onRefreshRateChange: (instanceId: string, seconds: number) => Promise<void>
}

function DashboardGrid({ instances, onReorder, onRefreshRateChange }: DashboardGridProps) {
  const sensors = useSensors(
    // A 5px threshold so a plain click on the handle doesn't count as a drag.
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
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
              onRefreshRateChange={(seconds) => onRefreshRateChange(instance.id, seconds)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}


type DashboardProps = {
  onLogout : () => void
}

function Dashboard({onLogout} : DashboardProps) {
  const [instances, setInstances] = useState<WidgetInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  // The dashboard route isn't protected yet, so check the session here to only
  // show account-specific controls to logged-in users.
  // Only the id, not the whole session object: getUserSession() returns a new
  // object on every render, which would re-run the effect below every time.
  const userId = getUserSession()?.id

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    fetchWidgetInstances(userId)
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
  }, [userId])

  function handleReorder(activeId: string, overId: string) {
    const oldIndex = instances.findIndex((instance) => instance.id === activeId)
    const newIndex = instances.findIndex((instance) => instance.id === overId)
    const reordered = arrayMove(instances, oldIndex, newIndex)
      .map((instance, index) => ({ ...instance, position: index }))
    setInstances(reordered)
    // TODO(#11): saveWidgetOrder(reordered.map((instance) => instance.id))
  }

  if (!userId) {
    return <Navigate to="/Connexion" replace />
  }

  const handleRefreshRateChange = async (instanceId: string, refreshRateSeconds: number) => {
    const saved = await updateWidgetRefreshRate(userId, instanceId, refreshRateSeconds)
    setInstances((current) =>
      current.map((instance) =>
        instance.id === instanceId ? { ...instance, refreshRateSeconds: saved } : instance,
      ),
    )
  }

  // A const arrow function after the check above, so TypeScript knows userId
  // is a string here (a hoisted `function` would lose that).
  const handleAddWidget = async (
    definition: WidgetDefinition,
    config: Record<string, string | number>,
    refreshRateSeconds: number,
  ) => {
    const created = await createWidgetInstance(userId, definition.id, config, refreshRateSeconds)
    // The server returns the full instance, so the card appears without refetching.
    setInstances((current) => [...current, created])
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
        onRefreshRateChange={handleRefreshRateChange}
      />
    )
  }

  function handleLogout() {
    onLogout()
    navigate('/connexion', {replace : true})
  }

  return (
    <div className="dashboard-layout">
      <NavBar brandTo="/dashboard">
        <GithubMenu onAddWidget={handleAddWidget} />
        <GoogleMenu onAddWidget={handleAddWidget} />
        <DiscordMenu onAddWidget={handleAddWidget} />
        <ThemeButton/>
        <button type="button" onClick={handleLogout}>Log out</button>
      </NavBar>
      <main className="dashboard-page">{renderContent()}</main>
    </div>
  )
}

export default Dashboard
