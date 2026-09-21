// adapters/extern/database/prisma-user.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { UserRepositoryPort } from '../../../domain/port/user.repository.js';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: { email: string; passwordHash: string }) {
    return this.prisma.user.create({ data });
  }
}
