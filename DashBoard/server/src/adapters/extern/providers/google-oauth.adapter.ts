import { Injectable } from "@nestjs/common";
import { AuthProviderPort } from "../../../domain/port/provider.repository.js";
import { Identity } from "../../../dto/oauth.dto.js";
import axios from 'axios';

@Injectable()
export class GoogleOauthAdapter implements AuthProviderPort {
  async authenticate(params: Record<string, string>): Promise<Identity> {
    const callId = Math.random().toString(36).slice(2, 8);
    console.log(`[${callId}] params:`, params);
    
    const { code } = params;
    console.log(`[${callId}] code:`, code);

  try {
      console.log(process.env.GOOGLE_API_SECRET)
      console.log(process.env.GOOGLE_CLIENT_ID)
      console.log(process.env.GOOGLE_REDIRECT_URI)
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
      console.log(res.data)
    
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
}
