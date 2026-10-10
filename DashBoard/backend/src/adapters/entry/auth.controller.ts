// auth.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthUseCase, type AuthResult } from '../../domain/useCases/auth.use-case.js';
import { LoginDto, SignupDto } from '../../dto/auth.dto.js';
import { JwtAuthGuard, type AuthenticatedUser } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthUseCase) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user (signup)' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  createUser(@Body() dto: SignupDto): Promise<AuthResult> {
    return this.authService.signUp(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return tokens (login)' })
  @ApiResponse({ status: 200, description: 'Authentication successful, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  logInUser(@Body() dto: LoginDto): Promise<AuthResult> {
    return this.authService.logIn(dto.email, dto.password);
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
