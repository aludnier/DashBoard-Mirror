import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller.js';
import { ProviderService } from '../../domain/useCases/provider.service.js';
import { ProviderSolverAdapter } from '../extern/provider-solver.adapter.js';

@Module({
  controllers: [OauthController],
  providers: [ProviderService, ProviderSolverAdapter],
})
export class OauthModule {}
