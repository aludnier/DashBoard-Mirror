// Mirrors server/prisma/schema.prisma -> WidgetDefinition (only the fields the shell needs to render a card).
export interface WidgetDefinitionSummary {
  id: string
  name: string
  slug: string
}

// Mirrors server/prisma/schema.prisma -> WidgetInstance.
// positionX/positionY/width/height are grid units, not pixels, and are what
// react-grid-layout persists back through onDragStop / onResizeStop.
export interface WidgetInstance {
  id: string
  widgetDefinitionId: string
  widgetDefinition?: WidgetDefinitionSummary
  config: Record<string, unknown>
  refreshRateSeconds: number
  positionX: number
  positionY: number
  width: number
  height: number
}
