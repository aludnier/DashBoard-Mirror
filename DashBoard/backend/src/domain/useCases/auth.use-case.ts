import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { USER_REPOSITORY, type UserRepositoryPort, type CreateUserData, type User } from '../port/user.repository.js';
import { MAILER, type MailerPort } from '../port/mailer.js';

export type PublicUser = Pick<User, 'id' | 'name' | 'email'>;

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

// Signup no longer logs the user in: they must click the emailed link first.
export interface MessageResult {
  message: string;
}

/* "subject" sub is the standard JWT claim for who the token is about.
The payload is readable by anyone, so nothing secret goes here. */
export interface JwtPayload {
  sub: string;
  email: string;
}

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthUseCase {
  private readonly logger = new Logger(AuthUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(MAILER) private readonly mailer: MailerPort,
    private readonly jwt: JwtService,
  ) {}

  async signUp(email: string, password: string, name: string): Promise<MessageResult> {
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { token, tokenHash, expires } = this.newVerificationToken();

    const data: CreateUserData = {
      email,
      passwordHash,
      name,
      verificationToken: tokenHash,
      verificationTokenExpires: expires,
    };
    const user = await this.users.create(data);

    await this.sendVerification(user, token);
    return { message: 'Account created, check your inbox to verify your email' };
  }

  async verifyEmail(token: string): Promise<AuthResult> {
    const user = await this.users.findByVerificationToken(this.hashToken(token));
    if (!user || !user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    const verified = await this.users.markEmailVerified(user.id);
    return this.issueToken(verified);
  }

  async resendVerification(email: string): Promise<MessageResult> {
    const user = await this.users.findByEmail(email);
    // Same answer whether or not the account exists, so this can't be used to probe emails.
    if (user && !user.emailVerified) {
      const { token, tokenHash, expires } = this.newVerificationToken();
      await this.users.setVerificationToken(user.id, tokenHash, expires);
      await this.sendVerification(user, token);
    }
    return { message: 'A new link has been sent' };
  }

  async logIn(email: string, password: string): Promise<AuthResult> {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.emailVerified) {
      throw new ForbiddenException('Please verify your email before logging in');
    }
    return this.issueToken(user);
  }

  // The raw token only ever exists in the email link; the DB keeps its hash.
  private newVerificationToken() {
    const token = randomBytes(32).toString('hex');
    return {
      token,
      tokenHash: this.hashToken(token),
      expires: new Date(Date.now() + VERIFICATION_TTL_MS),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async sendVerification(user: User, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify?token=${token}`;
    try {
      await this.mailer.sendVerificationEmail(user.email, user.name, verifyUrl);
    } catch (err) {
      this.logger.error(`Could not send verification email to ${user.email}`, err as Error);
    }
  }

  private async issueToken(user: User): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
