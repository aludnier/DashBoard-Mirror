export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  create(data: { email: string; passwordHash: string }): Promise<User>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
