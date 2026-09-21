import { Module } from '@nestjs/common';
import { AppController } from './adapters/entry/app.controller.js';
import { AppService } from './domain/useCases/app.service.js';
import { AuthModule } from './adapters/entry/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
