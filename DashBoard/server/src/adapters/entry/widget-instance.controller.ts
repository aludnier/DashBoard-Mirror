import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { WidgetInstanceService } from '../../domain/useCases/widget-instance.service.js'
import { WidgetDataService } from '../../domain/useCases/widget-data.service.js'
import type { WidgetInstanceInfo } from '../../domain/port/widget.repository.js'
import { WidgetDataError, type WidgetData } from '../../domain/port/widget-data.provider.js'

// Same convention as POST /oauth/:provider/:id: the client sends the user id in
// the URL. Anyone who knows an id can read that user's widgets, so replace this
// with a logged-in-user token once auth issues one.
@Controller('users/:id/widget-instances')
export class WidgetInstanceController {
  constructor(
    private readonly widgetInstanceService: WidgetInstanceService,
    private readonly widgetDataService: WidgetDataService,
  ) {}

  @Get()
  listWidgetInstances(@Param('id') userId: string): Promise<WidgetInstanceInfo[]> {
    return this.widgetInstanceService.listForUser(userId)
  }

  @Get(':instanceId/data')
  async getWidgetData(
    @Param('id') userId: string,
    @Param('instanceId') instanceId: string,
  ): Promise<WidgetData> {
    try {
      return await this.widgetDataService.getData(userId, instanceId)
    } catch (error) {
      throw toHttpException(error)
    }
  }
}

function toHttpException(error: unknown): unknown {
  if (!(error instanceof WidgetDataError))
    return error

  switch (error.reason) {
    case 'not-found':
      return new NotFoundException(error.message)
    case 'not-connected':
      return new ConflictException(error.message)
    case 'bad-config':
      return new BadRequestException(error.message)
    case 'provider-failed':
      return new BadGatewayException(error.message)
  }
}
