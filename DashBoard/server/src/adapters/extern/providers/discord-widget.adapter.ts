import axios from 'axios'
import {
  WidgetDataError,
  WidgetDataGuilds,
  WidgetDataList,
  WidgetDataRecord,
  type WidgetData,
  type WidgetDataProviderPort,
} from '../../../domain/port/widget-data.provider.js'


export class DiscordWidgetAdapter implements WidgetDataProviderPort {
  async fetch(widgetSlug: string, config: Record<string, unknown>, accessToken: string): Promise<WidgetData> {
    try {
      switch (widgetSlug) {
        case 'my-servers':
            return await this.fetchUserGuilds(accessToken);
        default:
          throw new WidgetDataError(`Unknown Discord widget "${widgetSlug}"`, 'bad-config')
      }
    } catch (error) {
      throw toWidgetDataError(error)
    }
  }

  private async fetchUserGuilds(accessToken : string): Promise<WidgetData> {
    console.log(accessToken)
    const { data } = await axios.get("https://discord.com/api/v10/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { with_counts: true },
    })

    console.log("[DISCORD] mapping..")
    const guilds = data.map((g: any) => ({
      id: g.id,
      name: g.name,
      iconUrl: g.icon
        ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
        : null,
      isAdmin: (BigInt(g.permissions) & 0x8n) === 0x8n,
      memeberCount: g.approximate_presence_count,
      memberOnline: g.approximate_member_count,
    }))
  
    return { kind: 'guilds', guilds : guilds } as WidgetDataGuilds
  }
}

function toWidgetDataError(error: unknown): unknown {
  if (!axios.isAxiosError(error))
    return error

  switch (error.response?.status) {
    case 401:
      return new WidgetDataError('Discord rejected the token, reconnect your account', 'not-connected')
    case 404:
      return new WidgetDataError('Repository not found, or your account has no access to it', 'bad-config')
    default:
      return new WidgetDataError('Could not reach Discord, try again later', 'provider-failed')
  }
}

