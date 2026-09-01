import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RefreshAuthUser {
  userId: string;
  tokenId: string;
  refreshToken: string;
}

export const CurrentRefreshUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RefreshAuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
