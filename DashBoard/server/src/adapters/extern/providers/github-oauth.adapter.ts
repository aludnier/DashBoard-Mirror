import { Injectable } from "@nestjs/common";
import { AuthProviderPort } from "../../../domain/port/provider.repository.js";
import { Identity } from "../../../dto/oauth.dto.js";
import axios from 'axios';

@Injectable()
export class GithubOauthAdapter implements AuthProviderPort {
  async authenticate(params: Record<string, string>): Promise<Identity> {

    const { code } = params;
    const client_id = process.env.GITHUB_CLIENT_ID!;
    const client_secret = process.env.GITHUB_CLIENT_SECRET!;
    const redirect_uri = process.env.GITHUB_REDIRECT_URI!;


    try {
      const res = await axios.post(
        "https://github.com/login/oauth/access_token",
        { client_id, client_secret, code, redirect_uri },
        { headers: { Accept: 'application/json' } },
      );

      if (res.data.error)
        throw new Error(`GitHub OAuth: ${res.data.error_description}`)

      const { access_token, refresh_token, expires_in } = res.data;

      const { data: user } = await axios.get('https://api.github.com/user', {
        headers : { Authorization: `Bearer ${access_token}` },
      });

      return new Identity(
        'github',
        String(user.id), user.email ?? undefined, user.login,
        access_token,
        refresh_token,
        expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
      )
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Github OAuth error:", error.response?.data);
      }
      throw error;
    }
  }
}
