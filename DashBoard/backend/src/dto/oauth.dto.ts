import { IsEnum } from "class-validator";

export class Identity {
  constructor(
    public readonly provider: string,
    public readonly externalId: string,
    public readonly email?: string,
    public readonly displayName?: string,
    public readonly accessToken?: string,
    public readonly refreshToken?: string,
    public readonly tokenExpiresAt?: Date,
  ) {}
}

export enum ProviderEnum {
    GOOGLE = "google",
    GITHUB = "github",
    DISCORD = "discord"
}

export class ProviderDto {
    @IsEnum(ProviderEnum)
    ProviderName : ProviderEnum;
    data : Record<string, string>
}
