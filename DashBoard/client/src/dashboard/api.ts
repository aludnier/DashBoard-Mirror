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

// One request for the whole dashboard: moving one widget shifts the position of
// every widget between its old and new index, so per-widget PATCHes would be N requests.
export async function saveWidgetOrder(orderedIds: string[]): Promise<void> {
  await api.put('/widget-instances/order', { orderedIds })
}

export interface WidgetSizeUpdate {
  width: number
  height: number
}

export async function updateWidgetInstanceSize(id: string, size: WidgetSizeUpdate): Promise<void> {
  await api.patch(`/widget-instances/${id}`, size)
}
