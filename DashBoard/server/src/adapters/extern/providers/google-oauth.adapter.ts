import { Injectable } from "@nestjs/common";
import { AuthProviderPort } from "../../../domain/port/provider.repository.js";
import { Identity } from "../../../dto/oauth.dto.js";


@Injectable()
export class GoogleOauthAdapter implements AuthProviderPort{
  async authenticate(params: Record<string, string>): Promise<Identity> {
    const { code } = params
    console.log(code)
    return new Identity("google", '1');
  }
}
