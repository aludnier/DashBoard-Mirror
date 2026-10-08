import {
  BadGatewayException,
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { WidgetInstanceService } from '../../domain/useCases/widget-instance.service.js'
import { WidgetDataService } from '../../domain/useCases/widget-data.service.js'
import type { WidgetInstanceInfo } from '../../domain/port/widget.repository.js'
import { WidgetDataError, type WidgetData } from '../../domain/port/widget-data.provider.js'
// A value import, not `import type`: ValidationPipe needs the class at runtime.
import { CreateWidgetInstanceDto, UpdateWidgetInstanceDto } from '../../dto/widget-instance.dto.js'

// Same convention as POST /oauth/:provider/:id: the client sends the user id in
// the URL. Anyone who knows an id can read that user's widgets, so replace this
// with a logged-in-user token once auth issues one.
@ApiBearerAuth()
@Controller('users/:id/widget-instances')
export class WidgetInstanceController {
  constructor(
    private readonly widgetInstanceService: WidgetInstanceService,
    private readonly widgetDataService: WidgetDataService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List widget instances for a user' })
  @ApiResponse({ status: 200, description: 'List of widget instances for the user' })
  listWidgetInstances(@Param('id') userId: string): Promise<WidgetInstanceInfo[]> {
    return this.widgetInstanceService.listForUser(userId)
  }

  // whitelist: drop any body field the DTO doesn't declare.
  @Post()
  @ApiOperation({ summary: 'Create a new widget instance for a user' })
  @ApiResponse({ status: 201, description: 'Widget instance created' })
  @ApiResponse({ status: 400, description: 'Invalid widget instance data' })
  @ApiResponse({ status: 409, description: 'Widget instance conflict or provider not connected' })
  async createWidgetInstance(
    @Param('id') userId: string,
    @Body(new ValidationPipe({ whitelist: true })) body: CreateWidgetInstanceDto,
  ): Promise<WidgetInstanceInfo> {
    try {
      return await this.widgetInstanceService.create(
        userId,
        body.widgetDefinitionId,
        body.config,
        body.refreshRateSeconds,
      )
    } catch (error) {
      throw toHttpException(error)
    }
  }

  @Patch(':instanceId')
  @ApiOperation({ summary: 'Update widget instance refresh rate' })
  @ApiResponse({ status: 200, description: 'Widget instance updated' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ApiResponse({ status: 404, description: 'Widget instance not found' })
  async updateWidgetInstance(
    @Param('id') userId: string,
    @Param('instanceId') instanceId: string,
    @Body(new ValidationPipe({ whitelist: true })) body: UpdateWidgetInstanceDto,
  ): Promise<WidgetInstanceInfo> {
    try {
      return await this.widgetInstanceService.updateRefreshRate(userId, instanceId, body.refreshRateSeconds)
    } catch (error) {
      throw toHttpException(error)
    }
  }

  @Get(':instanceId/data')
  @ApiOperation({ summary: 'Retrieve widget data for an instance' })
  @ApiResponse({ status: 200, description: 'Widget data returned' })
  @ApiResponse({ status: 404, description: 'Widget instance not found' })
  @ApiResponse({ status: 409, description: 'Provider not connected' })
  @ApiResponse({ status: 502, description: 'Provider failed to retrieve data' })
  @ApiResponse({ status: 400, description: 'Bad configuration for widget' })
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
