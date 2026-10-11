// auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthUseCase, type AuthResult, type MessageResult } from '../../domain/useCases/auth.use-case.js';
import { LoginDto, ResendVerificationDto, SignupDto, VerifyEmailDto } from '../../dto/auth.dto.js';
import { JwtAuthGuard, type AuthenticatedUser } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthUseCase) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user and email them a verification link (signup)' })
  @ApiResponse({ status: 201, description: 'User created, verification email sent' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  createUser(@Body(new ValidationPipe({ whitelist: true })) dto: SignupDto): Promise<MessageResult> {
    return this.authService.signUp(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return tokens (login)' })
  @ApiResponse({ status: 200, description: 'Authentication successful, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Email not verified yet' })
  logInUser(@Body(new ValidationPipe({ whitelist: true })) dto: LoginDto): Promise<AuthResult> {
    return this.authService.logIn(dto.email, dto.password);
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm an email with the token from the link, and log the user in' })
  @ApiResponse({ status: 200, description: 'Email verified, returns tokens' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification link' })
  verifyEmail(@Body(new ValidationPipe({ whitelist: true })) dto: VerifyEmailDto): Promise<AuthResult> {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send a new verification link' })
  @ApiResponse({ status: 200, description: 'Same answer whether or not the account exists' })
  resendVerification(@Body(new ValidationPipe({ whitelist: true })) dto: ResendVerificationDto): Promise<MessageResult> {
    return this.authService.resendVerification(dto.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the user the access token belongs to' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Missing, invalid or expired token' })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
