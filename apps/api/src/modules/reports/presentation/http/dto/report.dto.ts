import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import type { ReportMotifCode } from '../../../domain/entities/report.entity';

export class CreateReportDto {
  @IsIn([
    'NO_SHOW',
    'DELAY',
    'NOT_PERFORMED',
    'BEHAVIOUR',
    'PAYMENT',
    'OTHER',
  ])
  motif!: ReportMotifCode;

  @IsString()
  @MinLength(1)
  description!: string;
}

export class ListAdminReportsQueryDto {
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
}

export class CreateAdminReportActionDto {
  @IsIn(['MASK', 'CLASSIFY', 'DISMISS'])
  action!: 'MASK' | 'CLASSIFY' | 'DISMISS';

  @IsOptional()
  @IsString()
  reason?: string;
}
