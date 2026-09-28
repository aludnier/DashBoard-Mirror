import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service.js'
import type { WidgetInstanceInfo, WidgetRepositoryPort } from '../../../domain/port/widget.repository.js'

@Injectable()
export class PrismaWidgetRepository implements WidgetRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<WidgetInstanceInfo[]> {
    const instances = await this.prisma.widgetInstance.findMany({
      where: { userId },
      include: {
        widgetDefinition: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { position: 'asc' },
    })

    return instances.map(
      (instance): WidgetInstanceInfo => ({
        id: instance.id,
        widgetDefinitionId: instance.widgetDefinitionId,
        widgetDefinition: instance.widgetDefinition,
        config: instance.config as Record<string, unknown>,
        refreshRateSeconds: instance.refreshRateSeconds,
        position: instance.position,
        width: instance.width,
        height: instance.height,
      }),
    )
  }
}
