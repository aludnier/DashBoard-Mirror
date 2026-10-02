import { Injectable } from "@nestjs/common";
import { ProviderPort, WidgetData, YtPlaylistsWidgetData } from "../../../domain/port/provider.repository.js";
import { Identity } from "../../../dto/oauth.dto.js";
import axios from 'axios';
import { response } from "express";

@Injectable()
export class GoogleOauthAdapter implements ProviderPort {

  async authenticate(params: Record<string, string>): Promise<Identity> {
    const callId = Math.random().toString(36).slice(2, 8);
    const { code } = params;

  try {
      const res = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_API_SECRET!,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
    
      const { access_token, refresh_token, expires_in, id_token } = res.data;
    
  return new Identity(
      'google',
      "",
      "",
      "",
      access_token,
      refresh_token,
      new Date(Date.now() + expires_in * 1000),
    )
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Google OAuth error:", error.response?.data);
    }
    throw error;
  }
  }

  async refreshToken(token : string | null) : Promise<Identity | null> {
      if (!token) return null;
      try {
        const res = await axios.post(
          "https://oauth2.googleapis.com/token",
          new URLSearchParams({
            grant_type: "refresh_token",
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_API_SECRET!,
            refresh_token: token,
          }),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        const { access_token, refresh_token: newRefreshToken, expires_in, id_token } = res.data;

        return new Identity(
          'google',
          "",
          "",
          "",
          access_token,
          newRefreshToken ?? token,
          new Date(Date.now() + (expires_in || 0) * 1000),
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Google refresh token error:", error.response?.data);
        }
        throw error;
      }
    }
}
