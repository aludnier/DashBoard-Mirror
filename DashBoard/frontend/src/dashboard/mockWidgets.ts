import type { WidgetData, WidgetInstance } from './types'

// Fake data for trying the dashboard before GET /widget-instances exists.
// Only used when the app is started with VITE_MOCK_WIDGETS=true (see api.ts).
export const mockWidgetInstances: WidgetInstance[] = [
  {
    id: 'mock-weather-paris',
    widgetDefinitionId: 'def-weather',
    widgetDefinition: { id: 'def-weather', name: 'Weather', slug: 'weather' },
    config: { city: 'Paris' },
    refreshRateSeconds: 600,
    position: 0,
    width: 1,
    height: 2,
  },
  {
    // Same definition as above with a different config: two instances of one widget type.
    id: 'mock-weather-tokyo',
    widgetDefinitionId: 'def-weather',
    widgetDefinition: { id: 'def-weather', name: 'Weather', slug: 'weather' },
    config: { city: 'Tokyo' },
    refreshRateSeconds: 600,
    position: 1,
    width: 1,
    height: 2,
  },
  {
    id: 'mock-github-repos',
    widgetDefinitionId: 'def-github-repos',
    widgetDefinition: { id: 'def-github-repos', name: 'GitHub Repositories', slug: 'github-repos' },
    config: { username: 'octocat' },
    refreshRateSeconds: 300,
    position: 2,
    width: 2,
    height: 4,
  },
  {
    id: 'mock-clock',
    widgetDefinitionId: 'def-clock',
    widgetDefinition: { id: 'def-clock', name: 'Clock', slug: 'clock' },
    config: { timezone: 'Europe/Paris' },
    refreshRateSeconds: 60,
    position: 3,
    width: 2,
    height: 2,
  },
]

// Same content for every mock widget: enough to see how a list card looks.
export const mockWidgetData: WidgetData = {
  kind: 'list',
  items: [
    { id: '1', title: 'Fix login redirect', subtitle: '#42 by octocat', url: 'https://github.com' },
    { id: '2', title: 'Add weather widget', subtitle: '#41 by monalisa', url: 'https://github.com' },
    { id: '3', title: 'Update README', subtitle: '#40 by octocat' },
  ],
}
