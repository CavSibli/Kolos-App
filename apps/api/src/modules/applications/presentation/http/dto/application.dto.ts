import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
