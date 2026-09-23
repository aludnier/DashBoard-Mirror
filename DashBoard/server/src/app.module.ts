import { Module } from '@nestjs/common';
import { AppController } from './adapters/entry/app.controller.js';
import { AppService } from './domain/useCases/app.service.js';
import { AboutService } from './domain/useCases/about.service.js';
import { CATALOG_REPOSITORY } from './domain/port/catalog.repository.js';
import { PrismaService } from './adapters/extern/database/prisma.service.js';
import { PrismaCatalogRepository } from './adapters/extern/database/catalog.repository.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    AboutService,
    PrismaService,
    { provide: CATALOG_REPOSITORY, useClass: PrismaCatalogRepository },
  ],
})
export class AppModule {}
