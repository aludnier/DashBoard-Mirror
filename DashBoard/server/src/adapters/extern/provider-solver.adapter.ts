import { Injectable } from '@nestjs/common'
import { AuthProviderPort } from '../../domain/port/provider.repository.js'
import { GoogleOauthAdapter } from './providers/google-oauth.adapter.js'

@Injectable()
export class ProviderSolverAdapter {
  private readonly providers: Record<string, AuthProviderPort>

  constructor() {
    this.providers = { google : new GoogleOauthAdapter() }
  }

  resolve(name: string): AuthProviderPort {
    const provider = this.providers[name]
    if (!provider) throw new Error(`Provider inconnu: ${name}`)
    return provider
  }
}
