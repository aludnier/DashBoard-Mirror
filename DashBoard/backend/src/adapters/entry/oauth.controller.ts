import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProviderService } from '../../domain/useCases/provider.service.js';
import { ProviderDto, ProviderEnum } from '../../dto/oauth.dto.js';

@Controller('oauth')
export class OauthController {
    constructor(private readonly providerService : ProviderService) {}

    @Post(':provider/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Authenticate/associate OAuth provider for user' })
    @ApiResponse({ status: 200, description: 'OAuth provider authenticated and associated with user' })
    @ApiResponse({ status: 400, description: 'Invalid provider data' })
    registerServiceOauth(@Param('provider') provider : ProviderEnum, @Param('id') userId : string, @Body() body : Record<string, string>) {
        const dto : ProviderDto = { ProviderName : provider, data : body }
        return this.providerService.authentificate(userId, dto)
    }

}
