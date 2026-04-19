export type Role = 'ADMIN' | 'VENDEDOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: Role;
  password?: string;
}