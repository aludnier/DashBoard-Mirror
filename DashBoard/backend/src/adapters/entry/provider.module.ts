import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller.js';
import { ProviderService } from '../../domain/useCases/provider.service.js';
import { SUB_REPOSITORY } from '../../domain/port/subscription.repository.js';
import { PrismaSubscriptionRepository } from '../extern/database/prisma-subscription.repository.js';
import { ProviderSolverAdapter } from '../extern/provider-solver.adapter.js';
import { PrismaModule } from '../extern/database/prisma.module.js';

@Module({
    imports: [PrismaModule],
    controllers : [ProviderController],
    providers: [
        ProviderService,
        ProviderSolverAdapter,
        {provide : SUB_REPOSITORY, useClass: PrismaSubscriptionRepository}
    ]
})
export class ProviderModule {}
