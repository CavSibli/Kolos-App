import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';
import { RefreshTokenOrmEntity } from './refresh-token.orm-entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'banned_at', type: 'timestamptz', nullable: true })
  bannedAt!: Date | null;

  @Column({ name: 'ban_until', type: 'timestamptz', nullable: true })
  banUntil!: Date | null;

  @Column({ name: 'ban_reason', type: 'text', nullable: true })
  banReason!: string | null;

  @ManyToMany(() => RoleOrmEntity, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: RoleOrmEntity[];

  @OneToMany(() => RefreshTokenOrmEntity, (token) => token.user)
  refreshTokens!: RefreshTokenOrmEntity[];
}
