import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByIds(ids: UserId[]): Promise<User[]>;
  findByEmail(email: Email): Promise<User | null>;
  listForAdmin(options: {
    page: number;
    pageSize: number;
    q?: string;
    role?: string;
    banned?: boolean;
  }): Promise<{ items: User[]; total: number; page: number; pageSize: number }>;
  save(user: User): Promise<User>;
  existsByEmail(email: Email): Promise<boolean>;
}
