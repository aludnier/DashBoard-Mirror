import { api } from '../client'
import type { WidgetData, WidgetDefinition, WidgetInstance } from './types'
import { mockGithubData, mockWidgetData, mockWidgetInstances } from './mockWidgets'

// Opt-in only: start the dev server with VITE_MOCK_WIDGETS=true. Vite inlines
// this at build time, so a normal build (e.g. the Docker image) never uses mocks.
const USE_MOCK_WIDGETS = import.meta.env.VITE_MOCK_WIDGETS === 'true'

export async function fetchWidgetInstances(): Promise<WidgetInstance[]> {
  if (USE_MOCK_WIDGETS) {
    // Short delay so the "Loading your dashboard..." state is still visible.
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockWidgetInstances
  }

  const response = await api.get<WidgetInstance[]>(`/users/widget-instances`)
  return response.data
}

export async function createWidgetInstance(
  widgetDefinitionId: string,
  config: Record<string, string | number | boolean>,
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

  const response = await api.post<WidgetInstance>(`/users/widget-instances`, {
    widgetDefinitionId,
    config,
  })
  return response.data
}

export type WidgetUpdate = {
  width: number
  height: number
  refreshRate: number
  position: number
  config?: Record<string, string | number | boolean>
}

export async function updateWidgetInstance(instanceId: string,
  data: WidgetUpdate): Promise<void> {
  await api.patch<WidgetInstance>(`/users/widget-instances/${instanceId}`, {
      refreshRateSeconds: data.refreshRate,
      width: data.width,
      height: data.height,
      position: data.position,
      config: data.config
    })
}

export async function updateWidgetRefreshRate(
  instance: WidgetInstance,
  refreshRateSeconds: number,
): Promise<number> {
  if (USE_MOCK_WIDGETS) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return refreshRateSeconds
  }

  const response = await api.patch<WidgetInstance>(`/users/widget-instances/${instance.id}`, {
      refreshRateSeconds: refreshRateSeconds,
      width: instance.width,
      height: instance.height,
      position: instance.position,
    })
  return response.data.refreshRateSeconds
}

export async function deleteWidgetInstance(instanceId: string): Promise<void> {
  if (USE_MOCK_WIDGETS) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return
  }

  await api.delete(`/users/widget-instances/${instanceId}`)
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

export async function fetchWidgetData(instanceId: string): Promise<WidgetData> {
  if (USE_MOCK_WIDGETS) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return instanceId === 'mock-github-repos' ? mockGithubData : mockWidgetData
  }

  const response = await api.get<WidgetData>(`/users/widget-instances/${instanceId}/data`)
  return response.data
}
