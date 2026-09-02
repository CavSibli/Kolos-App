import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { RolesGuard } from '@shared/auth/roles.guard';
import { Roles } from '@shared/auth/roles.decorator';
import { CurrentUser } from '@shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '@shared/auth/current-user.decorator';
import { UpsertAidantProfileUseCase } from '../../../application/use-cases/upsert-aidant-profile.use-case';
import { UpsertAidantProfileDto } from '../dto/aidant-profile.dto';
import type { AidantProfileResponse } from '@kolos/shared-types';

@Controller()
export class AidantProfileController {
  constructor(
    private readonly upsertAidantProfileUseCase: UpsertAidantProfileUseCase,
  ) {}

  @Patch('me/aidant-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('aidant')
  async upsertProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertAidantProfileDto,
  ): Promise<AidantProfileResponse> {
    return this.upsertAidantProfileUseCase.execute({
      userId: user.userId,
      bio: dto.bio,
      rayonIntervention: dto.rayonIntervention,
    });
  }
}
