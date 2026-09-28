import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { RolesGuard } from '@shared/auth/roles.guard';
import { Roles } from '@shared/auth/roles.decorator';
import { CurrentUser } from '@shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '@shared/auth/current-user.decorator';
import { AuthorizePaymentUseCase } from '../../../application/use-cases/authorize-payment.use-case';
import type { AuthorizePaymentResponse } from '@kolos/shared-types';

@Controller('missions')
export class MissionsController {
  constructor(
    private readonly authorizePaymentUseCase: AuthorizePaymentUseCase,
  ) {}

  @Post(':id/payments/mock-authorize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('demandeur')
  async mockAuthorizePayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AuthorizePaymentResponse> {
    const result = await this.authorizePaymentUseCase.execute({
      missionId: id,
      demandeurId: user.userId,
    });

    return {
      missionId: result.missionId,
      status: result.status,
      montantTotal: result.montantTotal,
    };
  }
}
