import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PublishRequestDto {
  @IsString()
  @MaxLength(150)
  titre!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  contraintesPhysiques?: string;

  @IsString()
  adresse!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsDateString()
  dateMission!: string;

  @IsInt()
  @Min(1)
  dureeEstimee!: number;

  @IsInt()
  @Min(1)
  nbAidantsRequis!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetEstime?: number;
}

export class ListRequestsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

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
