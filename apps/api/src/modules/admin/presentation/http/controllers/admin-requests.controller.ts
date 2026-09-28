import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { RolesGuard } from '@shared/auth/roles.guard';
import { Roles } from '@shared/auth/roles.decorator';
import {
  CancelAdminRequestUseCase,
  CreateAdminRequestUseCase,
  GetAdminRequestUseCase,
  ListAdminRequestsUseCase,
  UpdateAdminRequestUseCase,
} from '../../../application/use-cases/admin-requests.use-cases';

class ListAdminRequestsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

class CreateAdminRequestDto {
  @IsUUID()
  demandeurId!: string;

  @IsString()
  @MinLength(1)
  titre!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsString()
  @MinLength(1)
  adresse!: string;

  @IsString()
  dateMission!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  dureeEstimee!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  nbAidantsRequis!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budgetEstime?: number | null;

  @IsOptional()
  @IsString()
  contraintesPhysiques?: string | null;
}

class UpdateAdminRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  titre?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  adresse?: string;

  @IsOptional()
  @IsString()
  dateMission?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dureeEstimee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  nbAidantsRequis?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budgetEstime?: number | null;

  @IsOptional()
  @IsString()
  contraintesPhysiques?: string | null;
}

@Controller('admin/requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminRequestsController {
  constructor(
    private readonly listRequests: ListAdminRequestsUseCase,
    private readonly getRequest: GetAdminRequestUseCase,
    private readonly createRequest: CreateAdminRequestUseCase,
    private readonly updateRequest: UpdateAdminRequestUseCase,
    private readonly cancelRequest: CancelAdminRequestUseCase,
  ) {}

  @Get()
  list(@Query() query: ListAdminRequestsQueryDto) {
    return this.listRequests.execute(query);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.getRequest.execute(id);
  }

  @Post()
  create(@Body() dto: CreateAdminRequestDto) {
    return this.createRequest.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminRequestDto,
  ) {
    return this.updateRequest.execute(id, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.cancelRequest.execute(id);
  }
}
