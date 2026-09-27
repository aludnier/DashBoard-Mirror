import { Inject, Injectable } from '@nestjs/common';
import { ProviderDto, ProviderEnum } from '../../dto/oauth.dto.js';
import { PROVIDER_REPOSITORY, type AuthProviderPort } from '../port/provider.repository.js';
import { ProviderSolverAdapter } from '../../adapters/extern/provider-solver.adapter.js';
import { SUB_REPOSITORY, type SubscriptionRepositoryPort } from '../port/subscription.repository.js';

@Injectable()
export class ProviderService {
    constructor(
        private readonly providerResolver : ProviderSolverAdapter,
        @Inject(SUB_REPOSITORY) private readonly subscriptionRepository : SubscriptionRepositoryPort
    ) {}

    async authentificate(userId : string, providerDto : ProviderDto) {
        const provider : AuthProviderPort = this.providerResolver.resolve(providerDto.ProviderName)
        console.log(providerDto.data)
        const identity = await provider.authenticate(providerDto.data)

        await this.subscriptionRepository.upsert(userId, identity)
        return { userId, ProviderDto }
    }
}
