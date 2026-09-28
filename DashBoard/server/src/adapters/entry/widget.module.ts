import { Module } from '@nestjs/common'
import { PrismaModule } from '../extern/database/prisma.module.js'
import { WidgetInstanceController } from './widget-instance.controller.js'
import { WidgetInstanceService } from '../../domain/useCases/widget-instance.service.js'
import { WIDGET_REPOSITORY } from '../../domain/port/widget.repository.js'
import { PrismaWidgetRepository } from '../extern/database/prisma-widget.repository.js'
import { WidgetDataService } from '../../domain/useCases/widget-data.service.js'
import { WIDGET_DATA_PROVIDERS, type WidgetDataProviders } from '../../domain/port/widget-data.provider.js'
import { GithubWidgetAdapter } from '../extern/providers/github-widget.adapter.js'

// One entry per service that has widgets. Keys are Service.slug values.
const widgetDataProviders: WidgetDataProviders = {
  github: new GithubWidgetAdapter(),
}

@Module({
  imports: [PrismaModule],
  controllers: [WidgetInstanceController],
  providers: [
    WidgetInstanceService,
    WidgetDataService,
    { provide: WIDGET_DATA_PROVIDERS, useValue: widgetDataProviders },
    { provide: WIDGET_REPOSITORY, useClass: PrismaWidgetRepository },
  ],

})
export class WidgetModule {}
