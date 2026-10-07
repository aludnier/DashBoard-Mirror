export type CatalogParam = {
  name: string
  type: 'integer' | 'string' | 'boolean'
}

export type CatalogWidget = {
  name: string
  params: CatalogParam[]
}

export type CatalogService = {
  name: string
  widgets: CatalogWidget[]
}

export type WidgetDefinitionParams = {
  key: string
  label: string
  type: 'STRING' | 'INTEGER' | 'ENUM' | 'BOOLEAN'
  required: boolean
  defaultValue: string | null
}

export type WidgetDefinitionInfo = {
  id: string
  slug: string
  name: string
  description: string | null
  defaultRefreshRate: number
  params: WidgetDefinitionParams[]
}

export const CATALOG_REPOSITORY = Symbol('CATALOG_REPOSITORY')

export interface CatalogRepository {
  getServices(): Promise<CatalogService[]>
  getWidgetDefinitions(serviceSlug: string): Promise<WidgetDefinitionInfo[] | null>
}
