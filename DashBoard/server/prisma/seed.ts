import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../src/generated/prisma/client.js'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

type ParamSeed = {
  key: string
  label: string
  type: 'STRING' | 'INTEGER'
  required?: boolean
  defaultValue?: string
}

type WidgetSeed = {
  slug: string
  name: string
  description?: string
  defaultRefreshRate?: number
  params: ParamSeed[]
}

async function upsertWidgetDefinition(serviceId: string, widget: WidgetSeed) {
  const definition = await prisma.widgetDefinition.upsert({
    where: { serviceId_slug: { serviceId, slug: widget.slug } },
    update: {
      name: widget.name,
      description: widget.description,
      defaultRefreshRate: widget.defaultRefreshRate ?? 300,
    },
    create: {
      serviceId,
      slug: widget.slug,
      name: widget.name,
      description: widget.description,
      defaultRefreshRate: widget.defaultRefreshRate ?? 300,
    },
  })

  for (const param of widget.params) {
    await prisma.widgetParam.upsert({
      where: { widgetDefinitionId_key: { widgetDefinitionId: definition.id, key: param.key } },
      update: {
        label: param.label,
        type: param.type,
        required: param.required ?? false,
        defaultValue: param.defaultValue,
      },
      create: {
        widgetDefinitionId: definition.id,
        key: param.key,
        label: param.label,
        type: param.type,
        required: param.required ?? false,
        defaultValue: param.defaultValue,
      },
    })
  }
}

async function main() {
  const github = await prisma.service.upsert({
    where: { slug: 'github' },
    update: { name: 'GitHub', description: 'Code hosting and issue tracking' },
    create: { slug: 'github', name: 'GitHub', description: 'Code hosting and issue tracking' },
  })

  await upsertWidgetDefinition(github.id, {
    slug: 'pull-requests',
    name: 'Pull Request List',
    description: 'Open pull requests for a repository',
    params: [
      { key: 'repo', label: 'Repository (owner/name)', type: 'STRING', required: true },
      { key: 'limit', label: 'Max results', type: 'INTEGER', defaultValue: '10' },
    ],
  })

  await upsertWidgetDefinition(github.id, {
    slug: 'issues',
    name: 'Issue Tracker',
    description: 'Issues for a repository',
    params: [
      { key: 'repo', label: 'Repository (owner/name)', type: 'STRING', required: true },
      { key: 'state', label: 'Issue state', type: 'STRING', defaultValue: 'open' },
    ],
  })

  const weather = await prisma.service.upsert({
    where: { slug: 'weather' },
    update: { name: 'Weather', description: 'Weather conditions and forecasts' },
    create: { slug: 'weather', name: 'Weather', description: 'Weather conditions and forecasts' },
  })

  await upsertWidgetDefinition(weather.id, {
    slug: 'current-conditions',
    name: 'Current Conditions',
    description: 'Current weather for a location',
    params: [
      { key: 'location', label: 'Location', type: 'STRING', required: true },
      { key: 'units', label: 'Units', type: 'STRING', defaultValue: 'metric' },
    ],
  })

  await upsertWidgetDefinition(weather.id, {
    slug: 'forecast',
    name: 'Forecast',
    description: 'Multi-day forecast for a location',
    params: [
      { key: 'location', label: 'Location', type: 'STRING', required: true },
      { key: 'days', label: 'Number of days', type: 'INTEGER', defaultValue: '5' },
    ],
  })

  console.log('Seed complete.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
