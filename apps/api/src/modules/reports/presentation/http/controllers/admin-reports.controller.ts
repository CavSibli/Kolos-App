import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { RolesGuard } from '@shared/auth/roles.guard';
import { Roles } from '@shared/auth/roles.decorator';
import { CurrentUser } from '@shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '@shared/auth/current-user.decorator';
import { ListAdminReportsUseCase } from '../../../application/use-cases/list-admin-reports.use-case';
import { ModerateReportUseCase } from '../../../application/use-cases/moderate-report.use-case';
import {
  CreateAdminReportActionDto,
  ListAdminReportsQueryDto,
} from '../dto/report.dto';
import type {
  ModeratedReportActionResponse,
  PaginatedAdminReportsResponse,
} from '@kolos/shared-types';

@Controller('admin/reports')
export class AdminReportsController {
  constructor(
    private readonly listAdminReportsUseCase: ListAdminReportsUseCase,
    private readonly moderateReportUseCase: ModerateReportUseCase,
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

  @Post(':reportId/actions')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async moderateReport(
    @CurrentUser() user: AuthenticatedUser,
    @Param('reportId', ParseIntPipe) reportId: number,
    @Body() dto: CreateAdminReportActionDto,
  ): Promise<ModeratedReportActionResponse> {
    return this.moderateReportUseCase.execute({
      reportId,
      adminId: user.userId,
      action: dto.action,
      reason: dto.reason,
    });
  }
}
