import type { UserRole } from '@kolos/shared-types';

export interface RoleProps {
  id: number;
  name: UserRole;
}

export class Role {
  constructor(private readonly props: RoleProps) {}

  get id(): number {
    return this.props.id;
  }

  get name(): UserRole {
    return this.props.name;
  }
}
