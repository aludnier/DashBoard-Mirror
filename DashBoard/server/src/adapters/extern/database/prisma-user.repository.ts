import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { CreateUserData, User, UserRepositoryPort } from '../../../domain/port/user.repository.js';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({where : { id }});
  }

  create(data: CreateUserData) {
    return this.prisma.user.create({ data });
  }
}
