import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity('roles')
export class RoleOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 50 })
  name!: string;

  @ManyToMany(() => UserOrmEntity, (user) => user.roles)
  users!: UserOrmEntity[];
}
