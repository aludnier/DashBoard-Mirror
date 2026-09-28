import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service.js'
import type { WidgetInstanceInfo, WidgetRepositoryPort, WidgetDataSource } from '../../../domain/port/widget.repository.js'

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

    async findDataSource(userId: string, instanceId: string): Promise<WidgetDataSource | null> {
    // findFirst rather than findUnique: filtering on userId as well as id means
    // a user can't read another user's widget by guessing its id.
    const instance = await this.prisma.widgetInstance.findFirst({
      where: { id: instanceId, userId },
      include: {
        widgetDefinition: { select: { slug: true, service: { select: { slug: true } } } },
        subscription: { select: { accessToken: true } },
      },
    })

    if (!instance) return null

    return {
      widgetSlug: instance.widgetDefinition.slug,
      serviceSlug: instance.widgetDefinition.service.slug,
      config: instance.config as Record<string, unknown>,
      accessToken: instance.subscription.accessToken,
    }
  }

}
