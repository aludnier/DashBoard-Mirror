import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProviderService } from '../../domain/useCases/provider.service.js';
import { ProviderDto, ProviderEnum } from '../../dto/oauth.dto.js';
import { JwtAuthGuard, type AuthenticatedUser } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('oauth')
export class OauthController {
    constructor(private readonly providerService : ProviderService) {}

    @Post(':provider')
    @ApiOperation({ summary: 'Authenticate/associate OAuth provider for user' })
    @ApiResponse({ status: 200, description: 'OAuth provider authenticated and associated with user' })
    @ApiResponse({ status: 400, description: 'Invalid provider data' })
    registerServiceOauth(@Param('provider') provider : ProviderEnum, @CurrentUser() user : AuthenticatedUser, @Body() body : Record<string, string>) {
        const dto : ProviderDto = { ProviderName : provider, data : body }
        return this.providerService.authentificate(user.userId, dto)
    }

}
