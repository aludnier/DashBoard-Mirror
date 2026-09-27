import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller.js';
import { ProviderService } from '../../domain/useCases/provider.service.js';
import { ProviderSolverAdapter } from '../extern/provider-solver.adapter.js';
import { SUB_REPOSITORY } from '../../domain/port/subscription.repository.js';
import { PrismaSubscriptionRepository } from '../extern/database/prisma-subscription.repository.js';
import { PrismaModule } from '../extern/database/prisma.module.js';

@Module({
  imports:[PrismaModule],
  controllers: [OauthController],
  providers: [
    ProviderService,
    ProviderSolverAdapter,
    {provide : SUB_REPOSITORY, useClass: PrismaSubscriptionRepository}
  ],
})
export class OauthModule {}
