import { Module } from '@nestjs/common';
import { AppController } from './adapters/entry/app.controller.js';
import { AppService } from './domain/useCases/app.service.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
