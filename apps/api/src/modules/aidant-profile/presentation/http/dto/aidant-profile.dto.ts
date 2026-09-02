import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpsertAidantProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsInt()
  @Min(1)
  rayonIntervention!: number;
}
