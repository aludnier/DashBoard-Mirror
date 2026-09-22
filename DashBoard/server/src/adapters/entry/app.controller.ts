import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AppService } from '../../domain/useCases/app.service.js';
import { AboutService, type AboutResponse } from '../../domain/useCases/about.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aboutService: AboutService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('about.json')
  getAbout(@Req() request: Request): Promise<AboutResponse> {
    const clientHost = request.ip ?? request.socket.remoteAddress ?? '';
    return this.aboutService.getAbout(clientHost);
  }
}
