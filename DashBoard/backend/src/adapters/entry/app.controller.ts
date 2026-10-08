import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { AppService } from '../../domain/useCases/app.service.js';
import { AboutService, type AboutResponse } from '../../domain/useCases/about.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aboutService: AboutService,
  ) {}

  @Get('about.json')
  @ApiOperation({ summary: 'Get about.json with client info' })
  @ApiResponse({ status: 200, description: 'Returns about information for the API and client' })
  getAbout(@Req() request: Request): Promise<AboutResponse> {
    const clientHost = request.ip ?? request.socket.remoteAddress ?? '';
    return this.aboutService.getAbout(clientHost);
  }
}
