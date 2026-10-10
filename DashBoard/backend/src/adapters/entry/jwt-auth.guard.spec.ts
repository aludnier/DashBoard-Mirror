import { type ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard.js'

const SECRET = 'test-secret'
const payload = { sub: 'user-1', email: 'alice@example.com' }

// The guard only calls switchToHttp().getRequest(), so that's all we fake.
function contextWith(authorization?: string) {
  const request = { headers: authorization ? { authorization } : {} } as AuthenticatedRequest
  const context = { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext
  return { request, context }
}

describe('JwtAuthGuard', () => {
  const jwt = new JwtService({ secret: SECRET, signOptions: { expiresIn: '1h' } })
  const guard = new JwtAuthGuard(jwt)

  it('lets a valid token through and attaches the user to the request', async () => {
    const token = await jwt.signAsync(payload)
    const { request, context } = contextWith(`Bearer ${token}`)

    await expect(guard.canActivate(context)).resolves.toBe(true)
    expect(request.user).toEqual({ userId: 'user-1', email: 'alice@example.com' })
  })

  it('rejects a request with no Authorization header', async () => {
    const { context } = contextWith()

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })

  it('rejects a header that is not a Bearer token', async () => {
    const token = await jwt.signAsync(payload)
    const { context } = contextWith(`Basic ${token}`)

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })

  it('rejects a token whose payload was changed', async () => {
    const token = await jwt.signAsync(payload)
    const [header, , signature] = token.split('.')
    const forgedPayload = Buffer.from(JSON.stringify({ ...payload, sub: 'user-2' })).toString('base64url')
    const { context } = contextWith(`Bearer ${header}.${forgedPayload}.${signature}`)

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })

  it('rejects a token signed with another secret', async () => {
    const token = await new JwtService({ secret: 'attacker-secret' }).signAsync(payload)
    const { context } = contextWith(`Bearer ${token}`)

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })

  it('rejects an expired token', async () => {
    // No default expiresIn here, so we can set an `exp` in the past ourselves.
    const expired = await new JwtService({ secret: SECRET })
      .signAsync({ ...payload, exp: Math.floor(Date.now() / 1000) - 60 })
    const { context } = contextWith(`Bearer ${expired}`)

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })
})
