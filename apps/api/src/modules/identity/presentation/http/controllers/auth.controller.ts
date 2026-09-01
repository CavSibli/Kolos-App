import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case';
import { RevokeSessionUseCase } from '../../../application/use-cases/revoke-session.use-case';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { AuthResponseSerializer } from '../serializers/auth-response.serializer';
import { RefreshAuthGuard } from '@shared/auth/refresh-auth.guard';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { CurrentRefreshUser, type RefreshAuthUser } from '@shared/auth/current-refresh-user.decorator';
import type { AuthResponse } from '@kolos/shared-types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.registerUserUseCase.execute(dto);
    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return AuthResponseSerializer.toResponse(result);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.loginUseCase.execute(dto);
    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return AuthResponseSerializer.toResponse(result);
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(RefreshAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async refresh(
    @CurrentRefreshUser() user: RefreshAuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.refreshTokenUseCase.execute({
      userId: user.userId,
      tokenId: user.tokenId,
      refreshToken: user.refreshToken,
    });
    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return AuthResponseSerializer.toResponse(result);
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cookieName =
      this.configService.get<string>('auth.refreshCookieName') ??
      'kolos_refresh';
    const refreshToken = req.cookies?.[cookieName] as string | undefined;
    await this.revokeSessionUseCase.execute(refreshToken);
    this.clearRefreshCookie(res);
  }

  private setRefreshCookie(
    res: Response,
    token: string,
    expiresAt: Date,
  ): void {
    const cookieName =
      this.configService.get<string>('auth.refreshCookieName') ??
      'kolos_refresh';
    const secure = this.configService.get<boolean>('auth.cookieSecure');
    const sameSite = this.configService.get<'lax' | 'strict' | 'none'>(
      'auth.cookieSameSite',
    );

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure,
      sameSite,
      expires: expiresAt,
      path: '/v1/auth',
    });
  }

  private clearRefreshCookie(res: Response): void {
    const cookieName =
      this.configService.get<string>('auth.refreshCookieName') ??
      'kolos_refresh';
    const secure = this.configService.get<boolean>('auth.cookieSecure');
    const sameSite = this.configService.get<'lax' | 'strict' | 'none'>(
      'auth.cookieSameSite',
    );

    res.clearCookie(cookieName, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/v1/auth',
    });
  }
}
