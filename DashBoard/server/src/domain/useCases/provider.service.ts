import { Inject, Injectable } from '@nestjs/common';
import { ProviderDto, ProviderEnum } from '../../dto/oauth.dto.js';
import { PROVIDER_REPOSITORY, WidgetData, type ProviderPort } from '../port/provider.repository.js';
import { ProviderSolverAdapter } from '../../adapters/extern/provider-solver.adapter.js';
import { SUB_REPOSITORY, type SubscriptionRepositoryPort } from '../port/subscription.repository.js';
import { WidgetDto } from '../../dto/widget.dto.js';

@Injectable()
export class ProviderService {
    constructor(
        private readonly providerResolver : ProviderSolverAdapter,
        @Inject(SUB_REPOSITORY) private readonly subscriptionRepository : SubscriptionRepositoryPort
    ) {}

    async authentificate(userId : string, providerDto : ProviderDto) {
        const provider : ProviderPort = this.providerResolver.resolve(providerDto.ProviderName)
        console.log(providerDto.data)
        const identity = await provider.authenticate(providerDto.data)

        await this.subscriptionRepository.upsert(userId, identity)
        return { userId, ProviderDto }
    }

    async fetchWidgetData(widgetDto : WidgetDto) {
        const provider : ProviderPort = this.providerResolver.resolve(widgetDto.provider)
        const token : string | null = await this.subscriptionRepository.getToken(widgetDto.userId, widgetDto.provider)
        
        console.log(token)
        const response : WidgetData = await provider.fetchWidgetData(widgetDto.userId, widgetDto.slug, token) ?? {}
        console.log(response)
        return response
    }
}
