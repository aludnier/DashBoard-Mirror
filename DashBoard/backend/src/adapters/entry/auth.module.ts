// adapters/entry/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../extern/database/prisma.module.js';
import { AuthUseCase } from '../../domain/useCases/auth.use-case.js';
import { USER_REPOSITORY } from  '../../domain/port/user.repository.js';
import { PrismaUserRepository } from '../extern/database/prisma-user.repository.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret)
          throw new Error('JWT_SECRET is not set, add it to backend/.env');
        return {
          secret,
          signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as StringValue },
        };
      },
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthUseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
})
export class AuthModule {}
