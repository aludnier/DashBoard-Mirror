// One row of a list widget. Every list-style widget (pull requests, issues,
// and later emails or games) returns this same shape, so the client needs a
// single component to display all of them.
export interface WidgetListItem {
  id: string
  title: string
  subtitle?: string
  url?: string
}

export interface WidgetData {
  items: WidgetListItem[]
}

// Implemented once per service (GitHub, Google, ...) in adapters/extern/providers.
export interface WidgetDataProviderPort {
  fetch(widgetSlug: string, config: Record<string, unknown>, accessToken: string): Promise<WidgetData>
}

// Providers keyed by service slug: { github: GithubWidgetAdapter, ... }.
export type WidgetDataProviders = Record<string, WidgetDataProviderPort>

export const WIDGET_DATA_PROVIDERS = Symbol('WIDGET_DATA_PROVIDERS')

// Thrown by the domain and the providers; the controller turns `reason` into an
// HTTP status, so nothing below the controller has to know about HTTP.
export class WidgetDataError extends Error {
  constructor(
    message: string,
    readonly reason: 'not-found' | 'not-connected' | 'bad-config' | 'provider-failed',
  ) {
    super(message)
  }
}
