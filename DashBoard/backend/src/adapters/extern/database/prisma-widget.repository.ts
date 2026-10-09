import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service.js'
import type {
  NewWidgetInstance,
  WidgetCreationContext,
  WidgetDataSource,
  WidgetInstanceInfo,
  WidgetRepositoryPort,
} from '../../../domain/port/widget.repository.js'
import { ProviderSolverAdapter } from '../provider-solver.adapter.js'
import { Identity } from '../../../dto/oauth.dto.js'
import {SUB_REPOSITORY, type SubscriptionRepositoryPort } from '../../../domain/port/subscription.repository.js'
import {  UpdateWidgetInstanceDto } from '../../../dto/widget-instance.dto.js'

// Shared by every query that returns WidgetInstanceInfo, so they stay identical.
const INSTANCE_INCLUDE = {
  widgetDefinition: { select: { id: true, name: true, slug: true } },
} as const

type InstanceRow = {
  id: string
  widgetDefinitionId: string
  widgetDefinition: { id: string; name: string; slug: string }
  config: unknown
  refreshRateSeconds: number
  position: number
  width: number
  height: number
}

function toInstanceInfo(instance: InstanceRow): WidgetInstanceInfo {
  return {
    id: instance.id,
    widgetDefinitionId: instance.widgetDefinitionId,
    widgetDefinition: instance.widgetDefinition,
    config: instance.config as Record<string, unknown>,
    refreshRateSeconds: instance.refreshRateSeconds,
    position: instance.position,
    width: instance.width,
    height: instance.height,
  }
}

@Injectable()
export class PrismaWidgetRepository implements WidgetRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerResolve: ProviderSolverAdapter,
    @Inject(SUB_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepositoryPort,
  ) {}

  async findByUserId(userId: string): Promise<WidgetInstanceInfo[]> {
    const instances = await this.prisma.widgetInstance.findMany({
      where: { userId },
      include: INSTANCE_INCLUDE,
      orderBy: { position: 'asc' },
    })

    return instances.map(toInstanceInfo)
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

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: instance.subscriptionId },
    })

    if (subscription?.tokenExpiresAt && Date.now() > subscription.tokenExpiresAt.getTime()) {
      const service = await this.prisma.service.findUnique({ where: { id: subscription.serviceId } })
      if (!service) return null

      const provider = this.providerResolve.resolve(service.slug)
      const newTokenIdentity: Identity | null = await provider.refreshToken(subscription.refreshToken)

      if (newTokenIdentity) {
        await this.subscriptionRepo.upsert(userId, newTokenIdentity)

        const refreshInstance = await this.prisma.widgetInstance.findFirst({
          where: { id: instanceId, userId },
          include: {
            widgetDefinition: { select: { slug: true, service: { select: { slug: true } } } },
            subscription: { select: { accessToken: true } },
          },
        })

        if (!refreshInstance) return null

        return {
          widgetSlug: refreshInstance.widgetDefinition.slug,
          serviceSlug: refreshInstance.widgetDefinition.service.slug,
          config: refreshInstance.config as Record<string, unknown>,
          accessToken: refreshInstance.subscription.accessToken,
        }
      }
    }

		return {
			widgetSlug: instance.widgetDefinition.slug,
			serviceSlug: instance.widgetDefinition.service.slug,
			config: instance.config as Record<string, unknown>,
			accessToken: instance.subscription.accessToken,
		}
	}

	async findCreationContext(userId: string, widgetDefinitionId: string): Promise<WidgetCreationContext | null> {
    const definition = await this.prisma.widgetDefinition.findUnique({
      where: { id: widgetDefinitionId },
      include: {
        params: true,
        service: {
          select: {
            slug: true,
            // At most one row: Subscription is @@unique([userId, serviceId]).
            subscriptions: { where: { userId, accessToken: { not: null } }, select: { id: true } },
          },
        },
      },
    })

    if (!definition) return null

    // max(position) rather than a count: after a widget is deleted, the count
    // could equal a position that is still in use.
    const { _max } = await this.prisma.widgetInstance.aggregate({
      where: { userId },
      _max: { position: true },
    })

    return {
      serviceSlug: definition.service.slug,
      subscriptionId: definition.service.subscriptions[0]?.id ?? null,
      defaultRefreshRate: definition.defaultRefreshRate,
      params: definition.params.map((param) => ({
        key: param.key,
        label: param.label,
        type: param.type,
        required: param.required,
        defaultValue: param.defaultValue,
      })),
      nextPosition: (_max.position ?? -1) + 1,
    }
  }

	async create(data: NewWidgetInstance): Promise<WidgetInstanceInfo> {
    const instance = await this.prisma.widgetInstance.create({
      data,
      include: INSTANCE_INCLUDE,
    })

    return toInstanceInfo(instance)
  }

  async updateData(
    userId: string,
    instanceId: string,
    body: UpdateWidgetInstanceDto
  ): Promise<WidgetInstanceInfo | null> {
    const {count} = await this.prisma.widgetInstance.updateMany({
      where: { id: instanceId, userId },
      data: { 
        refreshRateSeconds : body.refreshRateSeconds,
        height: body.height,
        width: body.width,
        position: body.position
       },
    })

    if (count === 0)
      return null

    const instance = await this.prisma.widgetInstance.findUniqueOrThrow({
      where: { id: instanceId },
      include: INSTANCE_INCLUDE,
    })

    return toInstanceInfo(instance)
  }

  async delete(userId: string, instanceId: string): Promise<boolean> {
    const { count } = await this.prisma.widgetInstance.deleteMany({
      where: { id: instanceId, userId },
    })
    return count > 0
  }
}
