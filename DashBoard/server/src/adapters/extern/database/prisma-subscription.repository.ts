import { Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma.service.js"
import { Identity } from "../../../dto/oauth.dto.js"
import { SubscriptionRepositoryPort } from "../../../domain/port/subscription.repository.js"

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, identity: Identity): Promise<void> {
    const service = await this.prisma.service.findUniqueOrThrow({
      where: { slug: identity.provider },
    })

    await this.prisma.subscription.upsert({
      where: {
        userId_serviceId: { userId, serviceId: service.id },
      },
      create: {
        userId,
        serviceId: service.id,
        accessToken: identity.accessToken,
        refreshToken: identity.refreshToken,
        tokenExpiresAt: identity.tokenExpiresAt,
      },
      update: {
        accessToken: identity.accessToken,
        refreshToken: identity.refreshToken ?? undefined,
        tokenExpiresAt: identity.tokenExpiresAt,
      },
    })
  }

  async getToken(userId : string, providerSlug :string) : Promise<string | null> {
    const service = await this.prisma.service.findUniqueOrThrow({
      where: { slug: providerSlug },
    })

    const response =  await this.prisma.subscription.findFirst({
      where : { serviceId : service.id, userId : userId },
    })
    // need to refresh if expired
    return response?.accessToken ?? null
  }
}
