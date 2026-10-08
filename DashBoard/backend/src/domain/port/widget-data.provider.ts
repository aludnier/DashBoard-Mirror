// One row of a list widget. Every list-style widget (pull requests, issues,
// and later emails or games) returns this same shape, so the client needs a
// single component to display all of them.

export interface WidgetListItem {
  id: string
  title: string
  subtitle?: string
  url?: string
}

export interface WidgetDataList {
  kind: 'list'
  items: WidgetListItem[]
}

export interface GithubItem {
  id: string
  number: number
  title: string
  url: string
  state: 'open' | 'closed' | 'merged' | 'draft'
  author: string
  authorAvatarUrl?: string
  createdAt: string
  labels: { name: string; color: string }[]
  comments?: number
}

export interface WidgetDataGithub {
  kind: 'github'
  type: 'pull-request' | 'issue'
  items: GithubItem[]
}

export interface WidgetDataGuilds {
  kind: 'guilds',
  guilds: {
    id: string,
    name: string,
    iconUrl: string | null,
    isAdmin: boolean,
    memberCount: number
    memberOnline: number
  }[]
}

export interface WidgetDataPlaylists {
  kind: 'playlists'
  playlists: {
    id: string
    title: string
    description?: string
    thumbnailUrl?: string
  }[]
}

export interface WidgetDataCalendar {
  kind : 'calendar'
  events : {
    id : string
    title: string
    description?: string
    location?: string
    startTime: string
    endTime: string
    linkUrl: string
  }[]
}

export interface WidgetDataEmails {
  kind: 'emails'
  emails: {
    id : string
    title : string
    sender : string
    date : string
    url : string
  }[]
}

export interface WidgetDataRecord {
  kind: 'record'
  data: Record<string, unknown>
}

export type WidgetData =
  | WidgetDataList
  | WidgetDataPlaylists
  | WidgetDataRecord
  | WidgetDataGuilds
  | WidgetDataEmails
  | WidgetDataCalendar
  | WidgetDataGithub

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
