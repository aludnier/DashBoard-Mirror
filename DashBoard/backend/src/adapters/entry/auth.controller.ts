// auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthUseCase } from '../../domain/useCases/auth.use-case.js';
import { LoginDto, SignupDto } from '../../dto/auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthUseCase) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user (signup)' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  createUser(@Body() dto: SignupDto) {
    return this.authService.signUp(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return tokens (login)' })
  @ApiResponse({ status: 200, description: 'Authentication successful, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  logInUser(@Body() dto: LoginDto) {
    return this.authService.logIn(dto.email, dto.password);
  }
}
