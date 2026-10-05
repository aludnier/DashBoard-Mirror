import { api } from '../client'
import type { WidgetData, WidgetDefinition, WidgetInstance } from './types'
import { mockWidgetData, mockWidgetInstances } from './mockWidgets'

// Opt-in only: start the dev server with VITE_MOCK_WIDGETS=true. Vite inlines
// this at build time, so a normal build (e.g. the Docker image) never uses mocks.
const USE_MOCK_WIDGETS = import.meta.env.VITE_MOCK_WIDGETS === 'true'

export async function fetchWidgetInstances(userId: string): Promise<WidgetInstance[]> {
  if (USE_MOCK_WIDGETS) {
    // Short delay so the "Loading your dashboard..." state is still visible.
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockWidgetInstances
  }

  const response = await api.get<WidgetInstance[]>(`/users/${userId}/widget-instances`)
  return response.data
}

export async function createWidgetInstance(
  userId: string,
  widgetDefinitionId: string,
  config: Record<string, string | number>,
  refreshRateSeconds: number,
): Promise<WidgetInstance> {
  if (USE_MOCK_WIDGETS) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      id: `mock-${crypto.randomUUID()}`,
      widgetDefinitionId,
      config,
      refreshRateSeconds,
      position: 0,
      width: 1,
      height: 1,
    }
  }

  const response = await api.post<WidgetInstance>(`/users/${userId}/widget-instances`, {
    widgetDefinitionId,
    config,
  })
  return response.data
}

export async function updateWidgetRefreshRate(
  userId: string,
  instanceId: string,
  refreshRateSeconds: number,
): Promise<number> {
  if (USE_MOCK_WIDGETS) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return refreshRateSeconds
  }

  const response = await api.patch<WidgetInstance>(`/users/${userId}/widget-instances/${instanceId}`, {
    refreshRateSeconds,
  })
  return response.data.refreshRateSeconds
}

export async function fetchWidgetDefinitions(serviceSlug: string): Promise<WidgetDefinition[]> {
  const response = await api.get<WidgetDefinition[]>(`/services/${serviceSlug}/widget-definitions`)
  return response.data
}

// One request for the whole dashboard: moving one widget shifts the position of
// every widget between its old and new index, so per-widget PATCHes would be N requests.
export async function saveWidgetOrder(orderedIds: string[]): Promise<void> {
  await api.put('/widget-instances/order', { orderedIds })
}

export async function fetchWidgetData(userId: string, instanceId: string): Promise<WidgetData> {
  if (USE_MOCK_WIDGETS) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockWidgetData
  }

  const response = await api.get<WidgetData>(`/users/${userId}/widget-instances/${instanceId}/data`)
  return response.data
}
