import {
  Body,
  Controller,
  Get,
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
import { ApplyToRequestUseCase } from '../../../application/use-cases/apply-to-request.use-case';
import { ListMyApplicationsUseCase } from '../../../application/use-cases/list-my-applications.use-case';
import { GetMyApplicationUseCase } from '../../../application/use-cases/get-my-application.use-case';
import { ListRequestApplicationsUseCase } from '../../../application/use-cases/list-request-applications.use-case';
import { DecideApplicationUseCase } from '../../../application/use-cases/decide-application.use-case';
import {
  ApplyToRequestDto,
  DecideApplicationDto,
  ListApplicationsQueryDto,
} from '../dto/application.dto';
import type {
  ApplicationResponse,
  ApplicationWithContextResponse,
  CandidateResponse,
  DecideApplicationResponse,
  PaginatedApplicationsWithContextResponse,
} from '@kolos/shared-types';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applyToRequestUseCase: ApplyToRequestUseCase,
    private readonly listMyApplicationsUseCase: ListMyApplicationsUseCase,
    private readonly getMyApplicationUseCase: GetMyApplicationUseCase,
    private readonly decideApplicationUseCase: DecideApplicationUseCase,
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

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('aidant')
  async listMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListApplicationsQueryDto,
  ): Promise<PaginatedApplicationsWithContextResponse> {
    return this.listMyApplicationsUseCase.execute({
      aidantId: user.userId,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('aidant')
  async getMine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApplicationWithContextResponse> {
    return this.getMyApplicationUseCase.execute(id, user.userId);
  }

  @Post(':id/decision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('demandeur')
  async decide(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DecideApplicationDto,
  ): Promise<DecideApplicationResponse> {
    return this.decideApplicationUseCase.execute({
      applicationId: id,
      demandeurId: user.userId,
      decision: dto.decision,
    });
  }
}

@Controller('requests')
export class RequestApplicationsController {
  constructor(
    private readonly listRequestApplicationsUseCase: ListRequestApplicationsUseCase,
  ) {}

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('demandeur')
  async listForRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CandidateResponse[]> {
    return this.listRequestApplicationsUseCase.execute({
      demandeurId: user.userId,
      demandeId: id,
    });
  }
}
