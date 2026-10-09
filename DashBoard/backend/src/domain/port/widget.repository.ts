import { UpdateWidgetInstanceDto } from '../../dto/widget-instance.dto.js'
import type { WidgetDefinitionParams } from './catalog.repository.js'

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

// A widget's settings after validation: every value is a string or a number.
export type WidgetConfig = Record<string, string | number | boolean>

// What the domain needs to know before creating a widget instance.
export interface WidgetCreationContext {
  serviceSlug: string
  // null when the user hasn't connected this service yet.
  subscriptionId: string | null
  defaultRefreshRate: number
  params: WidgetDefinitionParams[]
  // One past the user's current last widget, so the new one goes at the end.
  nextPosition: number
}

export interface NewWidgetInstance {
  userId: string
  subscriptionId: string
  widgetDefinitionId: string
  config: WidgetConfig
  refreshRateSeconds: number
  position: number
}

export interface WidgetRepositoryPort {
  findByUserId(userId: string): Promise<WidgetInstanceInfo[]>
  // null when the instance doesn't exist or belongs to another user.
  findDataSource(userId: string, instanceId: string): Promise<WidgetDataSource | null>
  // null when no widget definition has this id.
  findCreationContext(userId: string, widgetDefinitionId: string): Promise<WidgetCreationContext | null>
  create(data: NewWidgetInstance): Promise<WidgetInstanceInfo>
  updateData(userId: string, instanceId: string, data: UpdateWidgetInstanceDto): Promise<WidgetInstanceInfo | null>
  // false when the instance doesn't exist or belongs to another user.
  delete(userId: string, instanceId: string): Promise<boolean>
}

export const WIDGET_REPOSITORY = Symbol('WIDGET_REPOSITORY')
