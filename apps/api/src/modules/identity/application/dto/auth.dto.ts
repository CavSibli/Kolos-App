import type { UserRole } from '@kolos/shared-types';

export interface RegisterUserCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'demandeur' | 'aidant';
}

export interface AuthResult {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenId: string;
  refreshExpiresAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
  };
}
