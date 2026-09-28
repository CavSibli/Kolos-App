import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { RolesGuard } from '@shared/auth/roles.guard';
import { Roles } from '@shared/auth/roles.decorator';
import { GetAdminStatsUseCase } from '../../../application/use-cases/get-admin-stats.use-case';
import type { AdminStatsResponse } from '@kolos/shared-types';

@Controller('admin/stats')
export class AdminStatsController {
  constructor(private readonly getAdminStatsUseCase: GetAdminStatsUseCase) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getStats(): Promise<AdminStatsResponse> {
    return this.getAdminStatsUseCase.execute();
  }
}
