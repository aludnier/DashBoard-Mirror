import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, USER_REPOSITORY, type UserRepositoryPort } from '../port/user.repository.js';

@Injectable()
export class AuthUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async signUp(data : User) {
    if (await this.users.findByEmail(data.email)) {
      throw new ConflictException('Email already in use');
    }
    const passwordHash = await bcrypt.hash(data.passwordHash, 10);
    data.passwordHash = passwordHash
    const user = await this.users.create(data);
    return data;
  }

  async logIn(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email };
  }
}
