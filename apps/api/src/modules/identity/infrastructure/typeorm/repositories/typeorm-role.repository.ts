import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { Role } from '../../../domain/entities/role.entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import type { UserRole } from '@kolos/shared-types';

@Injectable()
export class TypeOrmRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
  ) {}

  async findByName(name: UserRole): Promise<Role | null> {
    const entity = await this.roleRepo.findOne({ where: { name } });
    if (!entity) {
      return null;
    }
    return new Role({ id: entity.id, name: entity.name as UserRole });
  }
}
