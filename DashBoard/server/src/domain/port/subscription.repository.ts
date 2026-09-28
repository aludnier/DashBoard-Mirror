import { Identity } from "../../dto/oauth.dto.js";

export interface SubscriptionRepositoryPort {
  upsert(userId: string, identity: Identity): Promise<void>
  getToken(userId : string, providerSlug :string) : Promise<string | null>
}

export const SUB_REPOSITORY = Symbol('SUB_REPOSITORY');
