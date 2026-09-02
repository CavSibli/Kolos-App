import {
  Body,
  Controller,
  Get,
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
import {
  ListRequestsQueryDto,
  PublishRequestDto,
} from '../dto/request.dto';
import type {
  PaginatedRequestsResponse,
  RequestResponse,
} from '@kolos/shared-types';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly publishRequestUseCase: PublishRequestUseCase,
    private readonly listPublishedRequestsUseCase: ListPublishedRequestsUseCase,
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

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('aidant')
  async listPublished(
    @Query() query: ListRequestsQueryDto,
  ): Promise<PaginatedRequestsResponse> {
    return this.listPublishedRequestsUseCase.execute({
      page: query.page,
      pageSize: query.pageSize,
    });
  }
}
