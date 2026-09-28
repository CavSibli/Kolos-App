import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { Role } from './role.entity';

export interface UserProps {
  id: UserId;
  email: Email;
  passwordHash: PasswordHash;
  firstName: string;
  lastName: string;
  roles: Role[];
  createdAt: Date;
  bannedAt: Date | null;
  banUntil: Date | null;
  banReason: string | null;
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): PasswordHash {
    return this.props.passwordHash;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get roles(): Role[] {
    return this.props.roles;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get bannedAt(): Date | null {
    return this.props.bannedAt;
  }

  get banUntil(): Date | null {
    return this.props.banUntil;
  }

  get banReason(): string | null {
    return this.props.banReason;
  }

  isBanned(now: Date): boolean {
    if (!this.props.bannedAt) {
      return false;
    }
    if (this.props.banUntil == null) {
      return true;
    }
    return this.props.banUntil.getTime() > now.getTime();
  }

  updateProfile(firstName: string, lastName: string): User {
    return new User({
      ...this.props,
      firstName,
      lastName,
    });
  }

  withProfile(input: {
    firstName?: string;
    lastName?: string;
    email?: Email;
    roles?: Role[];
  }): User {
    return new User({
      ...this.props,
      firstName: input.firstName ?? this.props.firstName,
      lastName: input.lastName ?? this.props.lastName,
      email: input.email ?? this.props.email,
      roles: input.roles ?? this.props.roles,
    });
  }

  ban(input: {
    now: Date;
    until: Date | null;
    reason: string | null;
  }): User {
    return new User({
      ...this.props,
      bannedAt: input.now,
      banUntil: input.until,
      banReason: input.reason,
    });
  }

  unban(): User {
    return new User({
      ...this.props,
      bannedAt: null,
      banUntil: null,
      banReason: null,
    });
  }
}
