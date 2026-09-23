export interface User {
  id: string;
  email: string;
  passwordHash: string;
}
export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
