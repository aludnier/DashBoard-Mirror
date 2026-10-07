import axios from 'axios'
import {
  WidgetDataEmails,
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
        case 'latest-emails':
            return await this.fetchLatestEmails(accessToken, config.limit as number, config.unread as boolean);
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

  private async fetchLatestEmails(token: string, maxEmails: number, unreadOnly : boolean): Promise<WidgetData> {
    const { data } = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        maxResults: maxEmails,
        q: (unreadOnly ? 'is:unread' : ''),
      },
    })

    const messages = data.messages ?? []

    const emails = await Promise.all(
      messages.map(async (message: any) => {
        const msg = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              format: 'metadata',
              metadataHeaders: ['From', 'Subject', 'Date'],
            },
          },
        )

        const headers = msg.data.payload?.headers ?? []
        const from = headers.find((h: any) => h.name === 'From')?.value ?? 'Unknown sender'
        const subject = headers.find((h: any) => h.name === 'Subject')?.value ?? '(No subject)'
        const date = headers.find((h: any) => h.name === 'Date')?.value ?? ''

        return {
          id: message.id,
          title: subject,
          sender: from,
          date: date,
          url: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
        }
      }),
    )

    return {
      kind: 'emails',
      emails,
    } as WidgetDataEmails
  }
}

// Turn Google's HTTP errors into messages the dashboard can show.
function toWidgetDataError(error: unknown): unknown {
  if (!axios.isAxiosError(error))
    return error

  switch (error.response?.status) {
    case 401:
      return new WidgetDataError('Google rejected the token, reconnect your account', 'not-connected')
    case 403:
      return new WidgetDataError('Missing Google permission or API not enabled', 'provider-failed')
    default:
      return new WidgetDataError('Could not reach Google, try again later', 'provider-failed')
  }
}

