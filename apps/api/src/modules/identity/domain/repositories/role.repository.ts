import { Role } from '../entities/role.entity';
import type { UserRole } from '@kolos/shared-types';

export interface RoleRepository {
  findByName(name: UserRole): Promise<Role | null>;
}
