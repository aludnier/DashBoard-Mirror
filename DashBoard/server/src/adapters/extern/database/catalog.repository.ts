import { Injectable } from '@nestjs/common'
import type { CatalogParam, CatalogRepository, CatalogService, CatalogWidget, WidgetDefinitionInfo } from '../../../domain/port/catalog.repository.js'
import { PrismaService } from './prisma.service.js'

@Injectable()
export class PrismaCatalogRepository implements CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getServices(): Promise<CatalogService[]> {
    const services = await this.prisma.service.findMany({
      include: {
        widgetDefinitions: {
          include: { params: true },
        },
      },
    })

    return services.map(
      (service): CatalogService => ({
        name: service.name,
        widgets: service.widgetDefinitions.map(
          (widget): CatalogWidget => ({
            name: widget.slug,
            params: widget.params.map(
              (param): CatalogParam => ({
                name: param.key,
                type: param.type === 'INTEGER' ? 'integer' : 'string',
              }),
            ),
          }),
        ),
      }),
    )
  }

  async getWidgetDefinitions(serviceSlug: string): Promise<WidgetDefinitionInfo[] | null> {
    const service = await this.prisma.service.findUnique({
      where: { slug: serviceSlug },
      include: {
        widgetDefinitions: {
          include: { params: true },
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!service) return null

    return service.widgetDefinitions.map(
      (definition): WidgetDefinitionInfo => ({
        id: definition.id,
        slug: definition.slug,
        name: definition.name,
        description: definition.description,
        defaultRefreshRate: definition.defaultRefreshRate,
        params: definition.params.map((param) => ({
          key: param.key,
          label: param.label,
          type: param.type,
          required: param.required,
          defaultValue: param.defaultValue,
        })),
      }),
    )
  }

}
