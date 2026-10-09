import axios from 'axios'
import {
  WidgetDataError,
  WidgetListItem,
  type WidgetData,
  type WidgetDataProviderPort,
} from '../../../domain/port/widget-data.provider.js'

/**
 * Steps to add a new widget provider:
 *  1. In the widget-data.provider.ts file, add your item type as a new WidgetData variant
 *     (e.g. { kind: 'example', type: 'thing', items: ExampleItem[] }).
 *  2. set API_BASE, the raw API interfaces and the widget slugs.
 *  3. Write one private fetchXxx() method per widget slug.
 *  4. Map the provider's HTTP errors in toWidgetDataError().
 *  5. Register the adapter wherever you pick a widget adapter by provider
 *     (factory / map / module providers).
 */

// TODO: provider API base URL
const API_BASE = 'https://api.example.com'

// TODO: replace with the provider's real response shape
interface ExampleApiResponse {
  id: number
  title: string
  url: string
  created_at: string
  owner: { name: string; avatar_url: string } | null
}

export class ExampleWidgetAdapter implements WidgetDataProviderPort {
  async fetch(widgetSlug: string, config: Record<string, unknown>, accessToken: string): Promise<WidgetData> {
    // Validate config up front: it comes from the database as untyped JSON.
    const target = parseTarget(config.target)
    const limit = parseLimit(config.limit)

    try {
      // One case per widget your provider offers.
      switch (widgetSlug) {
        case 'things': // TODO: rename slug (must match the widget slug stored in the DB)
          return await this.fetchThings(target, limit, accessToken)
        default:
          throw new WidgetDataError(`Unknown Example widget "${widgetSlug}"`, 'bad-config')
      }
    } catch (error) {
      // Always run errors through the mapper so the dashboard shows friendly messages.
      throw toWidgetDataError(error)
    }
  }

  private async fetchThings(target: string, limit: number, accessToken: string): Promise<WidgetData> {
    // TODO: replace with a real endpoint and query params
    const { data } = await axios.get<ExampleApiResponse[]>(`${API_BASE}/targets/${target}/things`, {
      headers: providerHeaders(accessToken),
      params: { per_page: limit },
    })

    return {
      kind: 'list', // TODO: must match the variant you added to WidgetData
      items: data.map(toExampleItem),
    }
  }

}

// TODO: auth + any version headers the provider requires
function providerHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  }
}

// Map the provider's raw shape to the shared item type the frontend renders.
// Keep all provider quirks (nullable users, odd state names) in this one function.
// TODO: replace the return value by the matching type of you added
function toExampleItem(item: ExampleApiResponse): WidgetListItem {
  return {
    id: String(item.id),
    title: item.title,
    url: item.url,
  }
}


function parseTarget(value: unknown): string {
  // TODO: adjust the pattern to what your URL path accepts
  if (typeof value !== 'string' || !/^[\w.-]+$/.test(value))
    throw new WidgetDataError('Set the "target" option', 'bad-config')
  return value
}

function parseLimit(value: unknown): number {
  const limit = Number(value ?? 10)
  // TODO: use the provider's maximum page size
  return Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 100) : 10
}

function toWidgetDataError(error: unknown): unknown {
  if (!axios.isAxiosError(error))
    return error

  switch (error.response?.status) {
    case 401:
      return new WidgetDataError('Provider rejected the token, reconnect your account', 'not-connected')
    case 404:
      return new WidgetDataError('Resource not found, or your account has no access to it', 'bad-config')
    // TODO: add provider-specific cases
    default:
      return new WidgetDataError('Could not reach the provider, try again later', 'provider-failed')
  }
}
