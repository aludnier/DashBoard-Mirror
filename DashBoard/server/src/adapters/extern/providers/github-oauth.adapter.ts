import { Injectable } from "@nestjs/common";
import { ProviderPort, WidgetData } from "../../../domain/port/provider.repository.js";
import { Identity } from "../../../dto/oauth.dto.js";
import axios from 'axios';

@Injectable()
export class GithubOauthAdapter implements ProviderPort {
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

  async refreshToken(token : string | null) : Promise<Identity | null> {
      if (!token) return null;
      try {
        const res = await axios.post(
          "https://github.com/login/oauth/access_token",
          new URLSearchParams({
            grant_type: "refresh_token",
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            refresh_token: token,
          }),
          { headers: { Accept: "application/json" } },
        );
        
        if (res.data.error) {
          throw new Error(`GitHub refresh failed: ${res.data.error_description ?? res.data.error}`);
        }
        
        const { access_token, expires_in, refresh_token: newRefreshToken } = res.data;
        if (!newRefreshToken) throw new Error("GitHub did not return a refresh token");

        const { data: user } = await axios.get('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        let email = user.email;
        if (!email) {
          try {
            const { data: emails } = await axios.get('https://api.github.com/user/emails', {
              headers: { Authorization: `Bearer ${access_token}` },
            });
            const primary = Array.isArray(emails) ? emails.find((e: any) => e.primary) || emails[0] : undefined;
            email = primary?.email;
          } catch (_) {
          }
        }

        const externalId = String(user.id ?? "");
        const displayName = user.login ?? user.name ?? undefined;

        return new Identity(
          'github',
          externalId,
          email ?? undefined,
          displayName,
          access_token,
          newRefreshToken ?? token,
          expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Google refresh token error:", error.response?.data);
        }
        throw error;
      }
    }

}
