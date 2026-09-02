import { BadRequestException } from '@nestjs/common';

export class RayonIntervention {
  private constructor(private readonly value: number) {}

  static create(value: number): RayonIntervention {
    if (!Number.isInteger(value) || value <= 0) {
      throw new BadRequestException('Le rayon d\'intervention doit être un entier positif');
    }
    return new RayonIntervention(value);
  }

  toNumber(): number {
    return this.value;
  }
}
