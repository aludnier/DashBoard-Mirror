export interface Widget {
    id : string
}

// What the dashboard needs to render one card. Mirrors the client's
// WidgetInstance type (client/src/dashboard/types.ts).
export interface WidgetInstanceInfo {
  id: string
  widgetDefinitionId: string
  widgetDefinition: {
    id: string
    name: string
    slug: string
  }
  config: Record<string, unknown>
  refreshRateSeconds: number
  position: number
  width: number
  height: number
}

// Everything needed to fetch one widget's data from its service.
export interface WidgetDataSource {
  widgetSlug: string
  serviceSlug: string
  config: Record<string, unknown>
  accessToken: string | null
}

export interface WidgetRepositoryPort {
  findByUserId(userId: string): Promise<WidgetInstanceInfo[]>
  // null when the instance doesn't exist or belongs to another user.
  findDataSource(userId: string, instanceId: string): Promise<WidgetDataSource | null>
}

export const WIDGET_REPOSITORY = Symbol('WIDGET_REPOSITORY')
