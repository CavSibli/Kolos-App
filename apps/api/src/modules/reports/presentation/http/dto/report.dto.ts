import { IsIn, IsString, MinLength } from 'class-validator';
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
