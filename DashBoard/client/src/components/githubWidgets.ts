import type { WidgetDefinitionSummary } from '../dashboard/types'

export interface GithubWidgetDefinition extends WidgetDefinitionSummary {
  description: string
}

// There's no GET /services/github/widget-definitions on the server yet, so the
// catalog is hardcoded here. Once it exists, fetch this list instead; the shape
// already mirrors server/prisma/schema.prisma -> WidgetDefinition.
export const githubWidgetDefinitions: GithubWidgetDefinition[] = [
  {
    id: 'def-github-repos',
    name: 'GitHub Repositories',
    slug: 'github-repos',
    description: 'Your most recently updated repositories.',
  },
  {
    id: 'def-github-pull-requests',
    name: 'Pull Requests',
    slug: 'github-pull-requests',
    description: 'Open pull requests waiting for your review.',
  },
  {
    id: 'def-github-notifications',
    name: 'Notifications',
    slug: 'github-notifications',
    description: 'Unread GitHub notifications.',
  },
]
