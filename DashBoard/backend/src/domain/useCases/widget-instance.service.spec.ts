import { WidgetInstanceService } from './widget-instance.service.js'
import type {
  NewWidgetInstance,
  WidgetCreationContext,
  WidgetInstanceInfo,
  WidgetRepositoryPort,
} from '../port/widget.repository.js'

const USER_ID = 'user-1'
const DEFINITION_ID = 'def-1'
const INSTANCE_ID = 'instance-1'

const context: WidgetCreationContext = {
  serviceSlug: 'github',
  subscriptionId: 'sub-1',
  defaultRefreshRate: 20,
  params: [],
  nextPosition: 0,
}

function toInfo(refreshRateSeconds: number): WidgetInstanceInfo {
  return {
    id: INSTANCE_ID,
    widgetDefinitionId: DEFINITION_ID,
    widgetDefinition: { id: DEFINITION_ID, name: 'Pull Request List', slug: 'pull-requests' },
    config: {},
    refreshRateSeconds,
    position: 0,
    width: 1,
    height: 1,
  }
}

// Replaces the Prisma adapter: the service only knows the port, so no database is needed.
function makeRepository() {
  return {
    findByUserId: vi.fn(),
    findDataSource: vi.fn(),
    findCreationContext: vi.fn(async () => context),
    create: vi.fn(async (data: NewWidgetInstance) => toInfo(data.refreshRateSeconds)),
    updateRefreshRate: vi.fn(
      async (_userId: string, _instanceId: string, seconds: number): Promise<WidgetInstanceInfo | null> =>
        toInfo(seconds),
    ),
  } satisfies WidgetRepositoryPort
}

describe('WidgetInstanceService', () => {
  let repository: ReturnType<typeof makeRepository>
  let service: WidgetInstanceService

  beforeEach(() => {
    repository = makeRepository()
    service = new WidgetInstanceService(repository)
  })

  describe('create', () => {
    it('uses the widget type default when no rate is given', async () => {
      const created = await service.create(USER_ID, DEFINITION_ID, {})
      expect(created.refreshRateSeconds).toBe(20)
    })

    it('uses the rate the user chose', async () => {
      await service.create(USER_ID, DEFINITION_ID, {}, 30)
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ refreshRateSeconds: 30 }))
    })

    it.each([10, 86400])('accepts the limit %s', async (seconds) => {
      const created = await service.create(USER_ID, DEFINITION_ID, {}, seconds)
      expect(created.refreshRateSeconds).toBe(seconds)
    })

    it.each([4, 86401, 2.5, 0, -10])('rejects %s without saving', async (seconds) => {
      await expect(service.create(USER_ID, DEFINITION_ID, {}, seconds))
        .rejects.toMatchObject({ reason: 'bad-config' })
      expect(repository.create).not.toHaveBeenCalled()
    })
  })

  describe('updateRefreshRate', () => {
    it('saves the new rate and returns the updated widget', async () => {
      const updated = await service.updateRefreshRate(USER_ID, INSTANCE_ID, 60)
      expect(repository.updateRefreshRate).toHaveBeenCalledWith(USER_ID, INSTANCE_ID, 60)
      expect(updated.refreshRateSeconds).toBe(60)
    })

    it("reports not-found when the widget doesn't exist or isn't the user's", async () => {
      repository.updateRefreshRate.mockResolvedValueOnce(null)
      await expect(service.updateRefreshRate(USER_ID, 'other', 60))
        .rejects.toMatchObject({ reason: 'not-found' })
    })

    it.each([4, 86401, 2.5])('rejects %s without touching the database', async (seconds) => {
      await expect(service.updateRefreshRate(USER_ID, INSTANCE_ID, seconds))
        .rejects.toMatchObject({ reason: 'bad-config' })
      expect(repository.updateRefreshRate).not.toHaveBeenCalled()
    })
  })
})
