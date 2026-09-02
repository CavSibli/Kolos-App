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
import { PublishRequestUseCase } from '../../../application/use-cases/publish-request.use-case';
import { ListPublishedRequestsUseCase } from '../../../application/use-cases/list-published-requests.use-case';
import { ListMyRequestsUseCase } from '../../../application/use-cases/list-my-requests.use-case';
import { GetRequestDetailUseCase } from '../../../application/use-cases/get-request-detail.use-case';
import {
  ListRequestsQueryDto,
  PublishRequestDto,
} from '../dto/request.dto';
import type {
  PaginatedPublishedRequestsResponse,
  PaginatedRequestsWithStatsResponse,
  RequestResponse,
  RequestWithStatsResponse,
} from '@kolos/shared-types';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly publishRequestUseCase: PublishRequestUseCase,
    private readonly listPublishedRequestsUseCase: ListPublishedRequestsUseCase,
    private readonly listMyRequestsUseCase: ListMyRequestsUseCase,
    private readonly getRequestDetailUseCase: GetRequestDetailUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('demandeur')
  async publish(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PublishRequestDto,
  ): Promise<RequestResponse> {
    return this.publishRequestUseCase.execute({
      demandeurId: user.userId,
      ...dto,
    });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('demandeur')
  async listMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListRequestsQueryDto,
  ): Promise<PaginatedRequestsWithStatsResponse> {
    return this.listMyRequestsUseCase.execute({
      demandeurId: user.userId,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('demandeur')
  async getDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RequestWithStatsResponse> {
    return this.getRequestDetailUseCase.execute(id, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('aidant')
  async listPublished(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListRequestsQueryDto,
  ): Promise<PaginatedPublishedRequestsResponse> {
    return this.listPublishedRequestsUseCase.execute({
      aidantId: user.userId,
      page: query.page,
      pageSize: query.pageSize,
    });
  }
}
