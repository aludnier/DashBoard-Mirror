import { Module } from '@nestjs/common'
import { PrismaModule } from '../extern/database/prisma.module.js'
import { WidgetInstanceController } from './widget-instance.controller.js'
import { WidgetInstanceService } from '../../domain/useCases/widget-instance.service.js'
import { WIDGET_REPOSITORY } from '../../domain/port/widget.repository.js'
import { PrismaWidgetRepository } from '../extern/database/prisma-widget.repository.js'

@Module({
  imports: [PrismaModule],
  controllers: [WidgetInstanceController],
  providers: [
    WidgetInstanceService,
    { provide: WIDGET_REPOSITORY, useClass: PrismaWidgetRepository },
  ],
})
export class WidgetModule {}
