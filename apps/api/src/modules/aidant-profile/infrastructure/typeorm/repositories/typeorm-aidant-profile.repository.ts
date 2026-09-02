import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AidantProfileRepository } from '../../../domain/repositories/aidant-profile.repository';
import { AidantProfile } from '../../../domain/entities/aidant-profile.entity';
import { ProfilAidantOrmEntity } from '../entities/profil-aidant.orm-entity';
import { AidantProfileOrmMapper } from '../mappers/aidant-profile.orm-mapper';
import { STATUS_LOOKUP } from '@shared/reference-data/reference-data.tokens';
import type { StatusLookupPort } from '@shared/reference-data/application/ports/status-lookup.port';

@Injectable()
export class TypeOrmAidantProfileRepository implements AidantProfileRepository {
  constructor(
    @InjectRepository(ProfilAidantOrmEntity)
    private readonly profileRepo: Repository<ProfilAidantOrmEntity>,
    @Inject(STATUS_LOOKUP)
    private readonly statusLookup: StatusLookupPort,
  ) {}

  async findByUserId(userId: string): Promise<AidantProfile | null> {
    const entity = await this.profileRepo.findOne({
      where: { userId },
      relations: ['statutVerification'],
    });
    return entity ? AidantProfileOrmMapper.toDomain(entity) : null;
  }

  async save(profile: AidantProfile): Promise<AidantProfile> {
    const statutId = await this.statusLookup.getVerificationStatusId(
      profile.verificationStatusCode,
    );
    const partial = AidantProfileOrmMapper.toOrm(profile, statutId);
    let entity = partial.id
      ? await this.profileRepo.findOne({
          where: { id: partial.id },
          relations: ['statutVerification'],
        })
      : null;

    if (!entity) {
      entity = this.profileRepo.create(partial);
    } else {
      Object.assign(entity, partial);
    }

    const saved = await this.profileRepo.save(entity);
    const reloaded = await this.profileRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['statutVerification'],
    });

    return AidantProfileOrmMapper.toDomain(reloaded);
  }
}
