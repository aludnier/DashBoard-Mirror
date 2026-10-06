import { Identity } from "../../dto/oauth.dto.js"

interface YoutubePlaylist {
    kind: string;
    etag: string;
    id: string;

    snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: {
            default?: {
                url: string;
                width: number;
                height: number;
            };
            medium?: {
                url: string;
                width: number;
                height: number;
            };
            high?: {
                url: string;
                width: number;
                height: number;
            };
        };
    };
    contentDetails: {
        itemCount: number;
    };
}
export class YtPlaylistsWidgetData {
  slug : string
  playlists: YoutubePlaylist[];
  constructor(data : any) {
    this.slug = 'Youtube'
    this.playlists = data.items as YoutubePlaylist[];
  }
  
}

export class CalendarWidgetData {
  
}

export type WidgetData =
  YtPlaylistsWidgetData | 
  CalendarWidgetData

export interface ProviderPort {
  authenticate(params: Record<string, string>): Promise<Identity>
 refreshToken(token : string | null) : Promise<Identity | null>
}

export const PROVIDER_REPOSITORY = Symbol('PROVIDER_REPOSITORY')
