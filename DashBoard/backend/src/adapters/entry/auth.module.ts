// adapters/entry/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../extern/database/prisma.module.js';
import { AuthUseCase } from '../../domain/useCases/auth.use-case.js';
import { User, USER_REPOSITORY, type UserRepositoryPort } from  '../../domain/port/user.repository.js';
import { PrismaUserRepository } from '../extern/database/prisma-user.repository.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthUseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
})
export class AuthModule {}
