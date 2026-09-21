import { ConflictException, Inject, Injectable} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../adapters/extern/database/prisma.service.js';

Injectable()
export class AuthService{
    constructor (@Inject(PrismaService) private readonly prismaService : PrismaService) {}


    async signUp(email :string, password :string) {
        const passwordHash = await bcrypt.hash(password, 10);
        console.log("\n" + email + "\n" + password)
        try {
            const user = await this.prismaService.user.create({
              data: { email, passwordHash },
            });
            return user;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException('Email already in use');
            }
            throw e;
        }
   }
}
