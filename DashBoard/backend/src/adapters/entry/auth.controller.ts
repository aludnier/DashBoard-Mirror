// auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthUseCase } from '../../domain/useCases/auth.use-case.js';
import { LoginDto, SignupDto } from '../../dto/auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthUseCase) {}

  @Post('signup')
  createUser(@Body() dto: SignupDto) {
    return this.authService.signUp(dto.email, dto.password, dto.name);
  }

  @Post('login')
  logInUser(@Body() dto: LoginDto) {
    return this.authService.logIn(dto.email, dto.password);
  }
}
