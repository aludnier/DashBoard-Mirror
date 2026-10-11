import { Widget } from "./widget.repository.js";

export interface User {
  id: string;
  name : string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpires: Date | null;
}
export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
  verificationToken: string;
  verificationTokenExpires: Date;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string) : Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  findByVerificationToken(token: string) : Promise<User | null>;
  markEmailVerified(id: string): Promise<User>;
  setVerificationToken(id: string, token: string, expires: Date): Promise<User>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
