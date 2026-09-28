import { api } from '../client'
import type { WidgetDefinition, WidgetInstance } from './types'
import { mockWidgetInstances } from './mockWidgets'

// Opt-in only: start the dev server with VITE_MOCK_WIDGETS=true. Vite inlines
// this at build time, so a normal build (e.g. the Docker image) never uses mocks.
const USE_MOCK_WIDGETS = import.meta.env.VITE_MOCK_WIDGETS === 'true'

// The user's widget instances, sorted by position, each including its
// widgetDefinition summary for display.
export async function fetchWidgetInstances(userId: string): Promise<WidgetInstance[]> {
  if (USE_MOCK_WIDGETS) {
    // Short delay so the "Loading your dashboard..." state is still visible.
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockWidgetInstances
  }

  const response = await api.get<WidgetInstance[]>(`/users/${userId}/widget-instances`)
  return response.data
}

// The widgets a service offers (e.g. 'github'). Not user-specific: it's the
// same catalog for everyone, read from the WidgetDefinition table.
export async function fetchWidgetDefinitions(serviceSlug: string): Promise<WidgetDefinition[]> {
  const response = await api.get<WidgetDefinition[]>(`/services/${serviceSlug}/widget-definitions`)
  return response.data
}

// One request for the whole dashboard: moving one widget shifts the position of
// every widget between its old and new index, so per-widget PATCHes would be N requests.
export async function saveWidgetOrder(orderedIds: string[]): Promise<void> {
  await api.put('/widget-instances/order', { orderedIds })
}
