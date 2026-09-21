import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthUseCase } from '../../domain/useCases/auth.use-case.js';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService : AuthUseCase) {}

    @Post('signup')
    createUser(@Body() user : {id : string, email : string, passwordHash: string}) {
        return this.authService.signUp(user)
    }

    @Post('login')
    logInUser(@Body() userData : {}) {
        return userData 
    }
}
