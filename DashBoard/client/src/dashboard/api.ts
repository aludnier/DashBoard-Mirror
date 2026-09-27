import { api } from '../client'
import type { WidgetInstance } from './types'
import { mockWidgetInstances } from './mockWidgets'

// Opt-in only: start the dev server with VITE_MOCK_WIDGETS=true. Vite inlines
// this at build time, so a normal build (e.g. the Docker image) never uses mocks.
const USE_MOCK_WIDGETS = import.meta.env.VITE_MOCK_WIDGETS === 'true'

// GET /widget-instances does not exist on the server yet (see server/src/adapters/entry).
// This is the contract the dashboard shell expects once it's built: the current
// user's widget instances, each including its widgetDefinition summary for display.
export async function fetchWidgetInstances(): Promise<WidgetInstance[]> {
  if (USE_MOCK_WIDGETS) {
    // Short delay so the "Loading your dashboard..." state is still visible.
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockWidgetInstances
  }

  const response = await api.get<WidgetInstance[]>('/widget-instances')
  return response.data
}

export interface WidgetPositionUpdate {
  positionX: number
  positionY: number
  width: number
  height: number
}

// Persistence of dragged/resized positions is tracked separately (issue #11).
// This is the call site that issue will wire up.
export async function updateWidgetInstancePosition(
  id: string,
  position: WidgetPositionUpdate,
): Promise<void> {
  await api.patch(`/widget-instances/${id}`, position)
}
