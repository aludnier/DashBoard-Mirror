// Mirrors server/prisma/schema.prisma -> WidgetDefinition (only the fields the shell needs to render a card).
export interface WidgetDefinitionSummary {
  id: string
  name: string
  slug: string
}

// Mirrors server/prisma/schema.prisma -> WidgetInstance.
export interface WidgetInstance {
  id: string
  widgetDefinitionId: string
  widgetDefinition?: WidgetDefinitionSummary
  config: Record<string, unknown>
  refreshRateSeconds: number
  position: number
  width: number
  height: number
}

export interface WidgetParamDefinition {
  key: string
  label: string
  type: 'STRING' | 'INTEGER'
  required: boolean
  defaultValue: string | null
}

export interface WidgetDefinition extends WidgetDefinitionSummary {
  description: string | null
  defaultRefreshRate: number
  params: WidgetParamDefinition[]
}

// Mirrors GET /users/:id/widget-instances/:instanceId/data (server: WidgetData).
export interface WidgetListItem {
  id: string
  title: string
  subtitle?: string
  url?: string
}

export interface WidgetData {
  items: WidgetListItem[]
}
