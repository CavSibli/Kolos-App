import {
  Body,
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
import { CreateReportUseCase } from '../../../application/use-cases/create-report.use-case';
import { CreateReportDto } from '../dto/report.dto';
import type { CreateReportResponse } from '@kolos/shared-types';

@Controller('missions')
export class MissionReportsController {
  constructor(private readonly createReportUseCase: CreateReportUseCase) {}

  @Post(':id/reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('demandeur', 'aidant')
  async createReport(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReportDto,
  ): Promise<CreateReportResponse> {
    return this.createReportUseCase.execute({
      missionId: id,
      authorId: user.userId,
      motif: dto.motif,
      description: dto.description,
    });
  }
}
