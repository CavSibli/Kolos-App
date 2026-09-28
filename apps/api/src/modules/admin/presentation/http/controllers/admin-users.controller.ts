import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { RolesGuard } from '@shared/auth/roles.guard';
import { Roles } from '@shared/auth/roles.decorator';
import { CurrentUser } from '@shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '@shared/auth/current-user.decorator';
import type { UserRole } from '@kolos/shared-types';
import {
  BanAdminUserUseCase,
  CreateAdminUserUseCase,
  GetAdminUserUseCase,
  ListAdminUsersUseCase,
  UnbanAdminUserUseCase,
  UpdateAdminUserUseCase,
} from '../../../application/use-cases/admin-users.use-cases';

class ListAdminUsersQueryDto {
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
  q?: string;

  @IsOptional()
  @IsIn(['demandeur', 'aidant', 'admin'])
  role?: UserRole;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  banned?: boolean;
}

class CreateAdminUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsIn(['demandeur', 'aidant'])
  role!: 'demandeur' | 'aidant';
}

class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsIn(['demandeur', 'aidant', 'admin'], { each: true })
  roles?: UserRole[];
}

class BanAdminUserDto {
  @IsOptional()
  @IsString()
  until?: string | null;

  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(
    private readonly listUsers: ListAdminUsersUseCase,
    private readonly getUser: GetAdminUserUseCase,
    private readonly createUser: CreateAdminUserUseCase,
    private readonly updateUser: UpdateAdminUserUseCase,
    private readonly banUser: BanAdminUserUseCase,
    private readonly unbanUser: UnbanAdminUserUseCase,
  ) {}

  @Get()
  list(@Query() query: ListAdminUsersQueryDto) {
    return this.listUsers.execute(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getUser.execute(id);
  }

  @Post()
  create(@Body() dto: CreateAdminUserDto) {
    return this.createUser.execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.updateUser.execute(id, dto);
  }

  @Post(':id/ban')
  ban(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: BanAdminUserDto,
  ) {
    return this.banUser.execute(id, admin.userId, dto);
  }

  @Post(':id/unban')
  unban(@Param('id') id: string) {
    return this.unbanUser.execute(id);
  }
}
