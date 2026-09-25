import { IsEnum } from "class-validator";

export class Identity {
  constructor(
    public readonly provider: string,
    public readonly externalId: string,
  ) {}
}

export enum ProviderEnum {
    GOOGLE = "google",
    GITHUB = "github",
    STEAM = "steam"
}

export class ProviderDto {
    @IsEnum(ProviderEnum)
    ProviderName : ProviderEnum;
    data : Record<string, string>
}
