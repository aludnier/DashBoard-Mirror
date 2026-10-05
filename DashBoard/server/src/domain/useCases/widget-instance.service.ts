import { Inject, Injectable } from '@nestjs/common'
import {
  WIDGET_REPOSITORY,
  type WidgetConfig,
  type WidgetInstanceInfo,
  type WidgetRepositoryPort,
} from '../port/widget.repository.js'
import type { WidgetDefinitionParams } from '../port/catalog.repository.js'
import { WidgetDataError } from '../port/widget-data.provider.js'
import { MAX } from 'class-validator'

@Injectable()
export class WidgetInstanceService {
  constructor(@Inject(WIDGET_REPOSITORY) private readonly widgetRepository: WidgetRepositoryPort) {}

  listForUser(userId: string): Promise<WidgetInstanceInfo[]> {
    return this.widgetRepository.findByUserId(userId)
  }

  async create(
    userId: string,
    widgetDefinitionId: string,
    config: Record<string, unknown>,
    refreshRateSeconds?: number
  ): Promise<WidgetInstanceInfo> {
    const context = await this.widgetRepository.findCreationContext(userId, widgetDefinitionId)
    if (!context)
      throw new WidgetDataError('Widget type not found', 'not-found')

    // WidgetInstance.subscriptionId is required: a widget can only exist for a
    // service the user has connected.
    if (!context.subscriptionId)
      throw new WidgetDataError(`Connect your ${context.serviceSlug} account first`, 'not-connected')

    return this.widgetRepository.create({
      userId,
      subscriptionId: context.subscriptionId,
      widgetDefinitionId,
      config: validateConfig(context.params, config),
      refreshRateSeconds:
        refreshRateSeconds === undefined ? context.defaultRefreshRate : validateRefreshRate(refreshRateSeconds),
      position: context.nextPosition,
    })
  }
}

// Checks the user's settings against the widget's WidgetParam rows: required
// params must be present, INTEGER params must be whole numbers, missing
// optional params get their default, and unknown keys are dropped.
function validateConfig(params: WidgetDefinitionParams[], input: Record<string, unknown>): WidgetConfig {
  const config: WidgetConfig = {}

  for (const param of params) {
    const raw = input[param.key]
    const isEmpty = raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')
    const value = isEmpty ? param.defaultValue : raw

    if (value === null) {
      if (param.required)
        throw new WidgetDataError(`"${param.label}" is required`, 'bad-config')
      continue
    }

    if (param.type === 'INTEGER') {
      const number = Number(value)
      if (!Number.isInteger(number))
        throw new WidgetDataError(`"${param.label}" must be a whole number`, 'bad-config')
      config[param.key] = number
    } else {
      if (typeof value !== 'string')
        throw new WidgetDataError(`"${param.label}" must be text`, 'bad-config')
      config[param.key] = value.trim()
    }
  }

  return config
}

const MIN_REFRESH_RATE_SECONDS = 10
const MAX_REFRESH_RATE_SECONDS = 60 * 60 * 24

function validateRefreshRate(seconds: number): number{
  if (!Number.isInteger(seconds) || seconds < MIN_REFRESH_RATE_SECONDS || seconds > MAX_REFRESH_RATE_SECONDS)
    throw new WidgetDataError(
      `Refresh rate must be a whole number between ${MIN_REFRESH_RATE_SECONDS} and ${MAX_REFRESH_RATE_SECONDS} seconds`,
      `bad-config`,
    )
    return seconds
}
