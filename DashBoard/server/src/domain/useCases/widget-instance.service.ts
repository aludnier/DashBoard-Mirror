import { Inject, Injectable } from '@nestjs/common'
import {
  WIDGET_REPOSITORY,
  type WidgetInstanceInfo,
  type WidgetRepositoryPort,
} from '../port/widget.repository.js'

@Injectable()
export class WidgetInstanceService {
  constructor(@Inject(WIDGET_REPOSITORY) private readonly widgetRepository: WidgetRepositoryPort) {}

  listForUser(userId: string): Promise<WidgetInstanceInfo[]> {
    return this.widgetRepository.findByUserId(userId)
  }
}
