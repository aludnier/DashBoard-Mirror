import { Body, Controller, Param, Post } from '@nestjs/common';
import { ProviderService } from '../../domain/useCases/provider.service.js';
import { ProviderDto, ProviderEnum } from '../../dto/oauth.dto.js';

@Controller('oauth')
export class OauthController {
    constructor(private readonly providerService : ProviderService) {}

    @Post(':provider/:id')
    registerServiceOauth(@Param('provider') provider : ProviderEnum, @Param('id') userId : string, @Body() body : Record<string, string>) {
        console.log(body)
        const dto : ProviderDto = { ProviderName : provider, data : body }
        return this.providerService.authentificate(userId, dto)
    }

}
