import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @Post('signup')
    createUser(@Body() user : {}) {
        return user
    }

    @Post('login')
    logInUser(@Body() userData : {}) {
        return userData
    }
}
