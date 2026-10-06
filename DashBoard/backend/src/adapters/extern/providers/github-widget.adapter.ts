import axios from 'axios'
import {
  WidgetDataError,
  WidgetDataList,
  type WidgetData,
  type WidgetDataProviderPort,
} from '../../../domain/port/widget-data.provider.js'

const GITHUB_API = 'https://api.github.com'

// Only the fields we read from GitHub's JSON: https://docs.github.com/en/rest
interface GithubPullRequest {
  id: number
  number: number
  title: string
  html_url: string
  user: { login: string } | null
}

interface GithubIssue extends GithubPullRequest {
  // Present only when the "issue" is actually a pull request.
  pull_request?: unknown
}

export class GithubWidgetAdapter implements WidgetDataProviderPort {
  async fetch(widgetSlug: string, config: Record<string, unknown>, accessToken: string): Promise<WidgetData> {
    const repo = parseRepo(config.repo)
    const limit = parseLimit(config.limit)

    try {
      switch (widgetSlug) {
        case 'pull-requests':
          return await this.fetchPullRequests(repo, limit, accessToken)
        case 'issues':
          return await this.fetchIssues(repo, limit, parseIssueState(config.state), accessToken)
        default:
          throw new WidgetDataError(`Unknown GitHub widget "${widgetSlug}"`, 'bad-config')
      }
    } catch (error) {
      throw toWidgetDataError(error)
    }
  }

  private async fetchPullRequests(repo: string, limit: number, accessToken: string): Promise<WidgetData> {
    const { data } = await axios.get<GithubPullRequest[]>(`${GITHUB_API}/repos/${repo}/pulls`, {
      headers: githubHeaders(accessToken),
      params: { state: 'open', per_page: limit },
    })

    return {
      kind: 'list',
      items: data.map(toListItem) } as WidgetDataList
  }

  private async fetchIssues(repo: string, limit: number, state: string, accessToken: string): Promise<WidgetData> {
    const { data } = await axios.get<GithubIssue[]>(`${GITHUB_API}/repos/${repo}/issues`, {
      headers: githubHeaders(accessToken),
      params: { state, per_page: limit },
    })

    // GitHub's issues endpoint also returns pull requests; the PR widget covers those.
    return {
      kind: 'list',
      items: data.filter((issue) => !issue.pull_request).map(toListItem) } as WidgetDataList
  }
}

function githubHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function toListItem(item: GithubPullRequest) {
  return {
    id: String(item.id),
    title: item.title,
    subtitle: `#${item.number} by ${item.user?.login ?? 'unknown'}`,
    url: item.html_url,
  }
}

// config comes from the database as untyped JSON, so check it before building a URL with it.
function parseRepo(value: unknown): string {
  if (typeof value !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(value))
    throw new WidgetDataError('Set the "repo" option as owner/name', 'bad-config')
  return value
}

function parseLimit(value: unknown): number {
  const limit = Number(value ?? 10)
  // GitHub returns at most 100 items per page.
  return Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 100) : 10
}

function parseIssueState(value: unknown): string {
  return value === 'closed' || value === 'all' ? value : 'open'
}

// Turn GitHub's HTTP errors into messages the dashboard can show.
function toWidgetDataError(error: unknown): unknown {
  if (!axios.isAxiosError(error))
    return error

  switch (error.response?.status) {
    case 401:
      return new WidgetDataError('GitHub rejected the token, reconnect your account', 'not-connected')
    case 404:
      return new WidgetDataError('Repository not found, or your account has no access to it', 'bad-config')
    default:
      return new WidgetDataError('Could not reach GitHub, try again later', 'provider-failed')
  }
}
