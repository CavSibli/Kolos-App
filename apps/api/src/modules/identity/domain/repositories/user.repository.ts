import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByIds(ids: UserId[]): Promise<User[]>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  existsByEmail(email: Email): Promise<boolean>;
}
