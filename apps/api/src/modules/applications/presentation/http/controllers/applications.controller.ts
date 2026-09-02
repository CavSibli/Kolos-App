import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { RolesGuard } from '@shared/auth/roles.guard';
import { Roles } from '@shared/auth/roles.decorator';
import { CurrentUser } from '@shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '@shared/auth/current-user.decorator';
import { ApplyToRequestUseCase } from '../../../application/use-cases/apply-to-request.use-case';
import { ApplyToRequestDto } from '../dto/application.dto';
import type { ApplicationResponse } from '@kolos/shared-types';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applyToRequestUseCase: ApplyToRequestUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('aidant')
  async apply(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ApplyToRequestDto,
  ): Promise<ApplicationResponse> {
    return this.applyToRequestUseCase.execute({
      aidantId: user.userId,
      demandeId: dto.demandeId,
      message: dto.message,
      prixPropose: dto.prixPropose,
    });
  }
}
