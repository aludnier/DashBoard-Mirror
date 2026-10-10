import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, type UserRepositoryPort, type CreateUserData, type User } from '../port/user.repository.js';

export type PublicUser = Omit<User, 'passwordHash'>;

// What the client gets back: never the password hash.
export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}
/* "subject" sub is the standard JWT claim for who the token is about.
The payload is readable by anyone, so nothing secret goes here. */
export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    private readonly jwt: JwtService,
  ) {}

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const data: CreateUserData = { email, passwordHash, name };
    const user = await this.users.create(data);

    return this.issueToken(user);
  }

  async logIn(email: string, password: string): Promise<AuthResult> {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueToken(user);
  }

  private async issueToken(user: User): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id,  email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    }
  }
}
