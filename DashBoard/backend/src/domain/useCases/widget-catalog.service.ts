import { Inject, Injectable } from '@nestjs/common'
import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
  type WidgetDefinitionInfo,
} from '../port/catalog.repository.js'

@Injectable()
export class WidgetCatalogService {
  constructor(@Inject(CATALOG_REPOSITORY) private readonly catalogRepository: CatalogRepository) {}

  getWidgetDefinitions(serviceSlug: string): Promise<WidgetDefinitionInfo[] | null> {
    return this.catalogRepository.getWidgetDefinitions(serviceSlug)
  }
}
