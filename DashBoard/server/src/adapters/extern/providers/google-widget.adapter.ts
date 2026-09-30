import axios from 'axios'
import {
  WidgetDataError,
  WidgetDataPlaylists,
  type WidgetData,
  type WidgetDataProviderPort,
} from '../../../domain/port/widget-data.provider.js'


export class GoogleWidgetAdapter implements WidgetDataProviderPort {
  async fetch(widgetSlug: string, config: Record<string, unknown>, accessToken: string): Promise<WidgetData> {
    try {
      switch (widgetSlug) {
        case 'yt-playlists':
            return await this.fetchYoutubePlaylists(accessToken);
        default:
          throw new WidgetDataError(`Unknown Google widget "${widgetSlug}"`, 'bad-config')
      }
    } catch (error) {
      throw toWidgetDataError(error)
    }
  }

  private async fetchYoutubePlaylists(token: string): Promise<WidgetData>{

    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
    part: 'snippet,contentDetails',
    mine: true,
    maxResults: 25,
  },
    })

    return {
        kind: 'playlists',
        playlists: data.items.map((p : any) => ({
            id: p.id,
            title: p.snippet.title,
            description: p.snippet.description || undefined,
            thumbnailUrl: p.snippet.thumbnails.default.url
        }))} as WidgetDataPlaylists
  }
}

// Turn Google's HTTP errors into messages the dashboard can show.
function toWidgetDataError(error: unknown): unknown {
  if (!axios.isAxiosError(error))
    return error

  switch (error.response?.status) {
    case 401:
      return new WidgetDataError('Google rejected the token, reconnect your account', 'not-connected')
    default:
      return new WidgetDataError('Could not reach Google, try again later', 'provider-failed')
  }
}

