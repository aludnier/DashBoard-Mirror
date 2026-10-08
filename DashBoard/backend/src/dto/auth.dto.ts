import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

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
