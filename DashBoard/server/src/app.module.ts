import { Module } from '@nestjs/common';
import { AppController } from './adapters/entry/app.controller.js';
import { AppService } from './domain/useCases/app.service.js';
import { AuthModule } from './adapters/entry/auth.module.js';
import { AboutService } from './domain/useCases/about.service.js';
import { CATALOG_REPOSITORY } from './domain/port/catalog.repository.js';
import { PrismaService } from './adapters/extern/database/prisma.service.js';
import { PrismaCatalogRepository } from './adapters/extern/database/catalog.repository.js';
import { OauthModule } from './adapters/entry/oauth.module.js';
import { ServicesController } from './adapters/entry/services.controller.js';
import { WidgetCatalogService } from './domain/useCases/widget-catalog.service.js';

@Module({
  imports: [AuthModule, OauthModule],
  controllers: [AppController, ServicesController],
  providers: [
    AppService,
    AboutService,
    WidgetCatalogService,
    PrismaService,
    { provide: CATALOG_REPOSITORY, useClass: PrismaCatalogRepository },
  ],
})
export class AppModule {}
