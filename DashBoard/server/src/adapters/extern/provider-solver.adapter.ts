import { Injectable } from '@nestjs/common'
import { ProviderPort } from '../../domain/port/provider.repository.js'
import { GoogleOauthAdapter } from './providers/google-oauth.adapter.js'
import { GithubOauthAdapter } from './providers/github-oauth.adapter.js'

@Injectable()
export class ProviderSolverAdapter {
  private readonly providers: Record<string, ProviderPort>

  constructor() {
    this.providers = { google : new GoogleOauthAdapter() , github : new GithubOauthAdapter()}
  }

  resolve(name: string): ProviderPort {
    const provider = this.providers[name]
    if (!provider) throw new Error(`Provider inconnu: ${name}`)
    return provider
  }
}
