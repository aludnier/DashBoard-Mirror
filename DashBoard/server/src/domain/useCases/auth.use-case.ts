import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, type UserRepositoryPort, type CreateUserData } from '../port/user.repository.js';

@Injectable()
export class AuthUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort) {}

  async signUp(email: string, password: string, name: string) {
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const data: CreateUserData = { email, passwordHash, name };
    console.log(data)
    const user = await this.users.create(data);

    return { id: user.id, email: user.email };
  }

  async logIn(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email };
  }
}
