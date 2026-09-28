import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { RolesGuard } from '@shared/auth/roles.guard';
import { Roles } from '@shared/auth/roles.decorator';
import { ListAdminReportsUseCase } from '../../../application/use-cases/list-admin-reports.use-case';
import { ListAdminReportsQueryDto } from '../dto/report.dto';
import type { PaginatedAdminReportsResponse } from '@kolos/shared-types';

@Controller('admin/reports')
export class AdminReportsController {
  constructor(
    private readonly listAdminReportsUseCase: ListAdminReportsUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listReports(
    @Query() query: ListAdminReportsQueryDto,
  ): Promise<PaginatedAdminReportsResponse> {
    return this.listAdminReportsUseCase.execute({
      page: query.page,
      pageSize: query.pageSize,
    });
  }
}
