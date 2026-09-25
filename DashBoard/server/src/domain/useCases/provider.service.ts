import { Inject, Injectable } from '@nestjs/common';
import { ProviderDto, ProviderEnum } from '../../dto/oauth.dto.js';
import { PROVIDER_REPOSITORY, type AuthProviderPort } from '../port/provider.repository.js';
import { ProviderSolverAdapter } from '../../adapters/extern/provider-solver.adapter.js';

@Injectable()
export class ProviderService {
    constructor(
        private readonly providerResolver : ProviderSolverAdapter,
    ) {}

    async authentificate(providerDto : ProviderDto) {
        const provider : AuthProviderPort = this.providerResolver.resolve(providerDto.ProviderName)
        const response = provider.authenticate(providerDto.data)
        // console.log(providerDto.ProviderName  == ProviderEnum.GOOGLE)
        return { name : providerDto.ProviderName, expect : ProviderEnum.GOOGLE}
    }
}
