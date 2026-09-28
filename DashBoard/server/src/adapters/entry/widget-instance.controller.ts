import { Controller, Get, Param } from '@nestjs/common'
import { WidgetInstanceService } from '../../domain/useCases/widget-instance.service.js'
import type { WidgetInstanceInfo } from '../../domain/port/widget.repository.js'

// Same convention as POST /oauth/:provider/:id: the client sends the user id in
// the URL. Anyone who knows an id can read that user's widgets, so replace this
// with a logged-in-user token once auth issues one.
@Controller('users/:id/widget-instances')
export class WidgetInstanceController {
  constructor(private readonly widgetInstanceService: WidgetInstanceService) {}

  @Get()
  listWidgetInstances(@Param('id') userId: string): Promise<WidgetInstanceInfo[]> {
    return this.widgetInstanceService.listForUser(userId)
  }
}
