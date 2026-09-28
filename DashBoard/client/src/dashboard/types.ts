// Mirrors server/prisma/schema.prisma -> WidgetDefinition (only the fields the shell needs to render a card).
export interface WidgetDefinitionSummary {
  id: string
  name: string
  slug: string
}

// Mirrors server/prisma/schema.prisma -> WidgetInstance.
// position is the index in the dashboard's reading order; width/height are
// grid spans (width out of 4 desktop columns, height in 120px rows).
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
