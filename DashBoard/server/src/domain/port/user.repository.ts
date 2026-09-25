import { Widget } from "./widget.repository.js";

export interface User {
  id: string;
  name : string;
  email: string;
  passwordHash: string;
  // widgetInstances : Widget;
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
