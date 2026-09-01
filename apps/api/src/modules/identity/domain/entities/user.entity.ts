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

  updateProfile(firstName: string, lastName: string): User {
    return new User({
      ...this.props,
      firstName,
      lastName,
    });
  }
}
