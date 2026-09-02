import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CandidatureStatusCode,
  DemandeStatusCode,
  StatusLookupPort,
  VerificationStatusCode,
} from '../../../application/ports/status-lookup.port';
import { StatutVerificationOrmEntity } from '../entities/statut-verification.orm-entity';
import { StatutDemandeOrmEntity } from '../entities/statut-demande.orm-entity';
import { StatutCandidatureOrmEntity } from '../entities/statut-candidature.orm-entity';

@Injectable()
export class TypeOrmStatusLookupRepository implements StatusLookupPort {
  constructor(
    @InjectRepository(StatutVerificationOrmEntity)
    private readonly verificationRepo: Repository<StatutVerificationOrmEntity>,
    @InjectRepository(StatutDemandeOrmEntity)
    private readonly demandeRepo: Repository<StatutDemandeOrmEntity>,
    @InjectRepository(StatutCandidatureOrmEntity)
    private readonly candidatureRepo: Repository<StatutCandidatureOrmEntity>,
  ) {}

  async getVerificationStatusId(
    code: VerificationStatusCode,
  ): Promise<number> {
    return this.resolveId(this.verificationRepo, code, 'verification');
  }

  async getDemandeStatusId(code: DemandeStatusCode): Promise<number> {
    return this.resolveId(this.demandeRepo, code, 'demande');
  }

  async getCandidatureStatusId(code: CandidatureStatusCode): Promise<number> {
    return this.resolveId(this.candidatureRepo, code, 'candidature');
  }

  async getDemandeStatusCode(id: number): Promise<DemandeStatusCode> {
    const entity = await this.demandeRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Demande status ${id} not found`);
    }
    return entity.code as DemandeStatusCode;
  }

  async getCandidatureStatusCode(id: number): Promise<CandidatureStatusCode> {
    const entity = await this.candidatureRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Candidature status ${id} not found`);
    }
    return entity.code as CandidatureStatusCode;
  }

  private async resolveId(
    repo: Repository<{ id: number; code: string }>,
    code: string,
    label: string,
  ): Promise<number> {
    const entity = await repo.findOne({ where: { code } });
    if (!entity) {
      throw new NotFoundException(`Status ${label} code ${code} not found`);
    }
    return entity.id;
  }
}
