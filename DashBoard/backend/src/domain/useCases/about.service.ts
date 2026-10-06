import { Inject, Injectable } from '@nestjs/common'
import { CATALOG_REPOSITORY, type CatalogRepository } from '../port/catalog.repository.js'

export type AboutResponse = {
  client: {
    host: string
  }
  server: {
    current_time: number
    services: Awaited<ReturnType<CatalogRepository['getServices']>>
  }
}

@Injectable()
export class AboutService {
  constructor(@Inject(CATALOG_REPOSITORY) private readonly catalogRepository: CatalogRepository) {}

  async getAbout(clientHost: string): Promise<AboutResponse> {
    const services = await this.catalogRepository.getServices()

    return {
      client: {
        host: clientHost,
      },
      server: {
        current_time: Math.floor(Date.now() / 1000),
        services,
      },
    }
  }
}
