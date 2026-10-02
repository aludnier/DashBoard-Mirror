import { Module } from '@nestjs/common'
import { PrismaModule } from '../extern/database/prisma.module.js'
import { WidgetInstanceController } from './widget-instance.controller.js'
import { WidgetInstanceService } from '../../domain/useCases/widget-instance.service.js'
import { WIDGET_REPOSITORY } from '../../domain/port/widget.repository.js'
import { PrismaWidgetRepository } from '../extern/database/prisma-widget.repository.js'
import { WidgetDataService } from '../../domain/useCases/widget-data.service.js'
import { WIDGET_DATA_PROVIDERS, type WidgetDataProviders } from '../../domain/port/widget-data.provider.js'
import { GithubWidgetAdapter } from '../extern/providers/github-widget.adapter.js'
import { GoogleWidgetAdapter } from '../extern/providers/google-widget.adapter.js'
import { ProviderSolverAdapter } from '../extern/provider-solver.adapter.js'
import { SUB_REPOSITORY } from '../../domain/port/subscription.repository.js'
import { PrismaSubscriptionRepository } from '../extern/database/prisma-subscription.repository.js'

// One entry per service that has widgets. Keys are Service.slug values.
const widgetDataProviders: WidgetDataProviders = {
  github: new GithubWidgetAdapter(),
  google: new GoogleWidgetAdapter(),
}

@Module({
  imports: [PrismaModule],
  controllers: [WidgetInstanceController],
  providers: [
    ProviderSolverAdapter,
    WidgetInstanceService,
    WidgetDataService,
    { provide: WIDGET_DATA_PROVIDERS, useValue: widgetDataProviders },
    { provide: WIDGET_REPOSITORY, useClass: PrismaWidgetRepository },
    { provide: SUB_REPOSITORY, useClass: PrismaSubscriptionRepository},
  ],

})
export class WidgetModule {}
