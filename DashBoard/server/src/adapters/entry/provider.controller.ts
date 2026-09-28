import { Controller, Get, Param } from '@nestjs/common';
import { ProviderEnum } from '../../dto/oauth.dto.js';
import { ProviderService } from '../../domain/useCases/provider.service.js';
import { WidgetDto } from '../../dto/widget.dto.js';

@Controller('provider')
export class ProviderController {
    constructor(private readonly providerService : ProviderService){}

    @Get(':provider/:id/:widget')
    GetWidget(@Param('provider') provider : ProviderEnum, @Param('id') userId : string, @Param('widget') widgetSlug : string) {
        const widgetDto : WidgetDto = { slug : widgetSlug, provider: provider, userId : userId }
        return this.providerService.fetchWidgetData(widgetDto)
    }

}
