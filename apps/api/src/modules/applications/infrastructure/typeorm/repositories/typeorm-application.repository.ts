import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationRepository } from '../../../domain/repositories/application.repository';
import { Application } from '../../../domain/entities/application.entity';
import { CandidatureOrmEntity } from '../entities/candidature.orm-entity';
import { ApplicationOrmMapper } from '../mappers/application.orm-mapper';
import { STATUS_LOOKUP } from '@shared/reference-data/reference-data.tokens';
import type { StatusLookupPort } from '@shared/reference-data/application/ports/status-lookup.port';

@Injectable()
export class TypeOrmApplicationRepository implements ApplicationRepository {
  constructor(
    @InjectRepository(CandidatureOrmEntity)
    private readonly candidatureRepo: Repository<CandidatureOrmEntity>,
    @Inject(STATUS_LOOKUP)
    private readonly statusLookup: StatusLookupPort,
  ) {}

  async existsByDemandeAndAidant(
    demandeId: number,
    aidantId: string,
  ): Promise<boolean> {
    const count = await this.candidatureRepo.count({
      where: { demandeId, aidantId },
    });
    return count > 0;
  }

  async save(application: Application): Promise<Application> {
    const statutId = await this.statusLookup.getCandidatureStatusId(
      application.statusCode,
    );
    const partial = ApplicationOrmMapper.toOrm(application, statutId);
    const entity = this.candidatureRepo.create(partial);
    const saved = await this.candidatureRepo.save(entity);
    const reloaded = await this.candidatureRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['statutCandidature'],
    });

    return ApplicationOrmMapper.toDomain(reloaded);
  }
}
