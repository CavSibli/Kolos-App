import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ApplyToRequestDto {
  @IsInt()
  @Min(1)
  demandeId!: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prixPropose?: number;
}

export class DecideApplicationDto {
  @IsIn(['ACCEPTED', 'REFUSED'])
  decision!: 'ACCEPTED' | 'REFUSED';
}

export class ListApplicationsQueryDto {
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
