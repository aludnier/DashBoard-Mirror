import { Identity } from "../../dto/oauth.dto.js"

export interface AuthProviderPort {
  authenticate(params: Record<string, string>): Promise<Identity>
}

export const PROVIDER_REPOSITORY = Symbol('PROVIDER_REPOSITORY')
