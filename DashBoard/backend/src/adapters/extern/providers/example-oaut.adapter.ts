import { Injectable } from "@nestjs/common";
import { ProviderPort } from "../../../domain/port/provider.repository.js";
import { Identity } from "../../../dto/oauth.dto.js";
import axios from "axios";

/**
 *
 * How to add a new provider:
 *  1. Create the OAuth app on the provider's dashboard and get client id/secret.
 *  2. Add the env vars below (EXAMPLE_*) to your .env (rename the prefix).
 *  3. Fill in the URLs and the user-profile mapping in this file.
 *  4. Register the class in your module's `providers` array.
 *  5. Wire it into wherever you pick an adapter by provider name
 *     (factory / map / switch on the provider string).
 */

// TODO: rename — provider key stored in Identity.provider
const PROVIDER_NAME = "example";

// TODO: specify provider endpoints
const TOKEN_URL = "https://example.com/oauth/token";
const USER_URL = "https://api.example.com/me";

@Injectable()
export class ExampleOauthAdapter implements ProviderPort {

  /**
   * Step 1: exchange the `code` from the callback for tokens,
   * then fetch the user's profile and return a normalized Identity.
   */
  async authenticate(params: Record<string, string>): Promise<Identity> {
    const { code } = params;

    try {
      // TODO: some providers want JSON (GitHub), others want
      // application/x-www-form-urlencoded (Google, Spotify, Discord).
      // If form-encoded, wrap the body in `new URLSearchParams({...})`.
      const res = await axios.post(
        TOKEN_URL,
        new URLSearchParams({
          grant_type: "authorization_code",
          // TODO: rename env vars to match the provider (e.g. SPOTIFY_CLIENT_ID)
          client_id: process.env.EXAMPLE_CLIENT_ID!,
          client_secret: process.env.EXAMPLE_CLIENT_SECRET!,
          code,
          redirect_uri: process.env.EXAMPLE_REDIRECT_URI!,
        }),
        // TODO: adapt the header to feat the provider reponse format
        // e.g. : GitHub -> { headers: { Accept: "application/json" } }
        //        Google -> {headers: { "Content-Type": "application/x-www-form-urlencoded" }
        { headers: { Accept: "application/json" } },
      );

      if (res.data.error) {
        throw new Error(
          `${PROVIDER_NAME} OAuth: ${res.data.error_description ?? res.data.error}`,
        );
      }

      const { access_token, refresh_token, expires_in } = res.data;

      return await this.buildIdentity(access_token, refresh_token, expires_in);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`${PROVIDER_NAME} OAuth error:`, error.response?.data);
      }
      throw error;
    }
  }

  /**
   * Step 2: use the stored refresh token to get a new access token.
   * Return null if there is nothing to refresh.
   */
  async refreshToken(token: string | null): Promise<Identity | null> {
    if (!token) return null;

    try {
      const res = await axios.post(
        TOKEN_URL,
        new URLSearchParams({
          grant_type: "refresh_token",
          // TODO: rename env vars to match the provider (e.g. SPOTIFY_CLIENT_ID)
          client_id: process.env.EXAMPLE_CLIENT_ID!,
          client_secret: process.env.EXAMPLE_CLIENT_SECRET!,
          refresh_token: token,
        }),
        { headers: { Accept: "application/json" } },
      );

      if (res.data.error) {
        throw new Error(
          `${PROVIDER_NAME} refresh failed: ${res.data.error_description ?? res.data.error}`,
        );
      }

      const { access_token, refresh_token, expires_in } = res.data;

      return await this.buildIdentity(
        access_token,
        refresh_token ?? token,
        expires_in,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `${PROVIDER_NAME} refresh token error:`,
          error.response?.data,
        );
      }
      throw error;
    }
  }

  private async buildIdentity(
    accessToken: string,
    refreshToken: string | undefined,
    expiresIn: number | undefined,
  ): Promise<Identity> {
    const { data: user } = await axios.get(USER_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // TODO: map the provider's profile fields.
    // e.g.:
    //   GitHub:  id=user.id,  email=user.email, name=user.login
    //   Discord: id=user.id,  email=user.email, name=user.username
    const externalId = String(user.id);
    const email: string | undefined = user.email ?? undefined;
    const displayName: string | undefined = user.name ?? undefined;

    return new Identity(
      PROVIDER_NAME,
      externalId,
      email,
      displayName,
      accessToken,
      refreshToken,
      expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
    );
  }
}
