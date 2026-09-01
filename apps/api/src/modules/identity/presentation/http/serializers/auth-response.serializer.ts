import type { AuthResult } from '../../../application/dto/auth.dto';
import type { AuthResponse } from '@kolos/shared-types';

export class AuthResponseSerializer {
  static toResponse(result: AuthResult): AuthResponse {
    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      user: result.user,
    };
  }
}
