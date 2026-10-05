import { Injectable } from "@nestjs/common";
import { ProviderPort } from "../../../domain/port/provider.repository.js";
import { Identity } from "../../../dto/oauth.dto.js";
import axios from 'axios';

@Injectable()
export class DiscordOauthAdapter implements ProviderPort {
  async authenticate(params: Record<string, string>): Promise<Identity> {

    const { code } = params;
    const client_id = process.env.DISCORD_CLIENT_ID!;
    const client_secret = process.env.DISCORD_CLIENT_SECRET!;
    const redirect_uri = process.env.DISCORD_REDIRECT_URI!;

    console.log("[DISCORD]: code - ", code)
    console.log("[DISCORD]: ID - ", client_id)
    console.log("[DISCORD]: Secret - ", client_secret)
    console.log("[DISCORD]: URI - ", redirect_uri )

    try {
      const formData = new URLSearchParams({
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "authorization_code",
        code : code,
        redirect_uri: redirect_uri,
      })

      const res = await axios.post(
        "https://discord.com/api/oauth2/token",
        formData,
        { headers: {"Content-Type" : "application/x-www-form-urlencoded"} },
      );

      if (res.data.error)
        throw new Error(`Discord OAuth: ${res.data.error_description}`)

      const { access_token, refresh_token, expires_in } = res.data;

      const userRes = await axios.get("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = userRes.data;

      return new Identity(
        "discord",
        user.id,
        user.global_name ?? user.username,
        user.email ?? "",
        access_token,
        refresh_token,
        expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("DISCORD OAuth error:", error.response?.data);
      }
      throw error;
    }
  }

  async refreshToken(token : string | null) : Promise<Identity | null> {
      if (!token) return null;
      try {
        const res = await axios.post(
          "https://discord.com/api/oauth2/token",
          new URLSearchParams({
            grant_type: "refresh_token",
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            refresh_token: token,
          }),
          { headers: { Accept: "application/json" } },
        );
        
        if (res.data.error) {
          throw new Error(`DISCORD refresh failed: ${res.data.error_description ?? res.data.error}`);
        }
        
        const { access_token, expires_in, refresh_token: newRefreshToken } = res.data;
        if (!newRefreshToken) throw new Error("DISCORD did not return a refresh token");

        const { data: user } = await axios.get('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        const externalId = String(user.id ?? "");

        return new Identity(
          'discord',
          externalId,
          user.global_name ?? user.username ?? undefined,
          user.email,
          access_token,
          newRefreshToken ?? token,
          expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("DISCORD refresh token error:", error.response?.data);
        }
        throw error;
      }
    }

}
