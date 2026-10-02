import { Controller, Get, Param } from '@nestjs/common';
import { ProviderService } from '../../domain/useCases/provider.service.js';

@Controller('provider')
export class ProviderController {
    constructor(private readonly providerService : ProviderService){}

}
