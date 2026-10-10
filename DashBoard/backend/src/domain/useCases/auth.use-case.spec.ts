import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { AuthUseCase, type JwtPayload } from './auth.use-case.js'
import type { CreateUserData, User, UserRepositoryPort } from '../port/user.repository.js'

const PASSWORD = 'password123'

// In-memory stand-in for the Prisma adapter: the use case only knows the port.
function makeRepository(existing: User[] = []) {
  const users = [...existing]
  return {
    findByEmail: vi.fn(async (email: string) => users.find((u) => u.email === email) ?? null),
    findById: vi.fn(async (id: string) => users.find((u) => u.id === id) ?? null),
    create: vi.fn(async (data: CreateUserData) => {
      const user: User = { id: `user-${users.length + 1}`, ...data }
      users.push(user)
      return user
    }),
  } satisfies UserRepositoryPort
}

describe('AuthUseCase', () => {
  // A real JwtService with a test secret: we want to check real tokens.
  const jwt = new JwtService({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })
  let alice: User

  beforeAll(async () => {
    // Cost 4 instead of 10: same algorithm, much faster tests.
    alice = { id: 'user-alice', name: 'Alice', email: 'alice@example.com', passwordHash: await bcrypt.hash(PASSWORD, 4) }
  })

  describe('logIn', () => {
    it('returns a token whose subject is the user id', async () => {
      const auth = new AuthUseCase(makeRepository([alice]), jwt)

      const result = await auth.logIn(alice.email, PASSWORD)

      const payload = await jwt.verifyAsync<JwtPayload>(result.accessToken)
      expect(payload.sub).toBe(alice.id)
      expect(payload.email).toBe(alice.email)
    })

    it('never sends the password hash back', async () => {
      const auth = new AuthUseCase(makeRepository([alice]), jwt)

      const result = await auth.logIn(alice.email, PASSWORD)

      expect(result.user).toEqual({ id: alice.id, name: alice.name, email: alice.email })
      expect(result.user).not.toHaveProperty('passwordHash')
    })

    it('rejects a wrong password', async () => {
      const auth = new AuthUseCase(makeRepository([alice]), jwt)

      await expect(auth.logIn(alice.email, 'wrong-password')).rejects.toThrow(UnauthorizedException)
    })

    it('rejects an unknown email with the same error as a wrong password', async () => {
      const auth = new AuthUseCase(makeRepository([alice]), jwt)

      await expect(auth.logIn('nobody@example.com', PASSWORD)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signUp', () => {
    it('stores a bcrypt hash, not the password, and logs the new user in', async () => {
      const repository = makeRepository()
      const auth = new AuthUseCase(repository, jwt)

      const result = await auth.signUp('bob@example.com', PASSWORD, 'Bob')

      const saved = repository.create.mock.calls[0][0]
      expect(saved.passwordHash).not.toBe(PASSWORD)
      expect(await bcrypt.compare(PASSWORD, saved.passwordHash)).toBe(true)
      const payload = await jwt.verifyAsync<JwtPayload>(result.accessToken)
      expect(payload.sub).toBe(result.user.id)
    })

    it('refuses an email that is already taken', async () => {
      const auth = new AuthUseCase(makeRepository([alice]), jwt)

      await expect(auth.signUp(alice.email, PASSWORD, 'Other')).rejects.toThrow(ConflictException)
    })
  })
})
