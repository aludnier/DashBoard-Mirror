import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { WidgetCatalogService } from '../../domain/useCases/widget-catalog.service.js'
import type { WidgetDefinitionInfo } from '../../domain/port/catalog.repository.js'

@Controller('services')
export class ServicesController {
  constructor(private readonly widgetCatalogService: WidgetCatalogService) {}

  @Get(':slug/widget-definitions')
  async getWidgetDefinitions(@Param('slug') slug: string): Promise<WidgetDefinitionInfo[]> {
    const definitions = await this.widgetCatalogService.getWidgetDefinitions(slug)
    if (!definitions) throw new NotFoundException(`Unknown service "${slug}"`)
    return definitions
  }
}
