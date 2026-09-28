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

export interface WidgetRepositoryPort {
  findByUserId(userId: string): Promise<WidgetInstanceInfo[]>
}

export const WIDGET_REPOSITORY = Symbol('WIDGET_REPOSITORY')
