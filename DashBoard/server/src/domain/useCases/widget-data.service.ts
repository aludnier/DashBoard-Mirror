import { Inject, Injectable } from '@nestjs/common'
import { WIDGET_REPOSITORY, type WidgetRepositoryPort } from '../port/widget.repository.js'
import {
  WIDGET_DATA_PROVIDERS,
  WidgetDataError,
  type WidgetData,
  type WidgetDataProviders,
} from '../port/widget-data.provider.js'

@Injectable()
export class WidgetDataService {
  constructor(
    @Inject(WIDGET_REPOSITORY) private readonly widgetRepository: WidgetRepositoryPort,
    @Inject(WIDGET_DATA_PROVIDERS) private readonly providers: WidgetDataProviders,
  ) {}

  async getData(userId: string, instanceId: string): Promise<WidgetData> {
    const source = await this.widgetRepository.findDataSource(userId, instanceId)
    if (!source)
      throw new WidgetDataError('Widget not found', 'not-found')

    if (!source.accessToken)
      throw new WidgetDataError(`Connect your ${source.serviceSlug} account first`, 'not-connected')

    const provider = this.providers[source.serviceSlug]
    if (!provider)
      throw new WidgetDataError(`No data provider for "${source.serviceSlug}" yet`, 'provider-failed')

    return provider.fetch(source.widgetSlug, source.config, source.accessToken)
  }
}
