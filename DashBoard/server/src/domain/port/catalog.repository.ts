export type CatalogParam = {
  name: string
  type: 'integer' | 'string'
}

export type CatalogWidget = {
  name: string
  params: CatalogParam[]
}

export type CatalogService = {
  name: string
  widgets: CatalogWidget[]
}

export const CATALOG_REPOSITORY = Symbol('CATALOG_REPOSITORY')

export interface CatalogRepository {
  getServices(): Promise<CatalogService[]>
}
