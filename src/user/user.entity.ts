import { UserRole } from '@prisma/client';

export class User {
  constructor(id: number, username: string, password: string, role: UserRole) {}
}
