import { Injectable } from '@nestjs/common'
import type { CatalogParam, CatalogRepository, CatalogService, CatalogWidget } from '../../../domain/port/catalog.repository.js'
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
}
