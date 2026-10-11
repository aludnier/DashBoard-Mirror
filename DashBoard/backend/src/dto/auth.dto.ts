import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsHexadecimal,
  IsString,
  Length,
  MinLength
} from 'class-validator';

export class SignupDto {
  @ApiProperty({description : "Name of new user.", example: "Alen"})
  @IsString()
  name: string;

  @ApiProperty({description : "Email of the new user.", example: "Alen@example.com"})
  @IsEmail()
  email: string;

  @ApiProperty({description: "Password that will be hashed.", example: "password123"})
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @ApiProperty({description: "User email", example: "Alen@example.com"})
  @IsEmail()
  email: string;

  @ApiProperty({description: "Unhached password of the user", example: "password123"})
  @IsString()
  password: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token from the verification link', example: '3f9a...e1c2 (64 hex chars)' })
  @IsHexadecimal()
  @Length(64, 64)
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({ description: 'Email of the unverified account', example: 'test@gmail.com' })
  @IsEmail()
  email: string;
}
