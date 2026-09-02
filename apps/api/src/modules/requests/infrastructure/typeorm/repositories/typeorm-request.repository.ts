import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestRepository } from '../../../domain/repositories/request.repository';
import { Request } from '../../../domain/entities/request.entity';
import { DemandeOrmEntity } from '../entities/demande.orm-entity';
import { RequestOrmMapper } from '../mappers/request.orm-mapper';
import { STATUS_LOOKUP } from '@shared/reference-data/reference-data.tokens';
import type { StatusLookupPort } from '@shared/reference-data/application/ports/status-lookup.port';
import type { PageResult } from '@shared/kernel/application/page-result';

@Injectable()
export class TypeOrmRequestRepository implements RequestRepository {
  constructor(
    @InjectRepository(DemandeOrmEntity)
    private readonly demandeRepo: Repository<DemandeOrmEntity>,
    @Inject(STATUS_LOOKUP)
    private readonly statusLookup: StatusLookupPort,
  ) {}

  async save(request: Request): Promise<Request> {
    const statutId = await this.statusLookup.getDemandeStatusId(
      request.statusCode,
    );
    const partial = RequestOrmMapper.toOrm(request, statutId);
    let entity = partial.id
      ? await this.demandeRepo.findOne({
          where: { id: partial.id },
          relations: ['statutDemande'],
        })
      : null;

    if (!entity) {
      entity = this.demandeRepo.create(partial);
    } else {
      Object.assign(entity, partial);
    }

    const saved = await this.demandeRepo.save(entity);
    const reloaded = await this.demandeRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['statutDemande'],
    });

    return RequestOrmMapper.toDomain(reloaded);
  }

  async findById(id: number): Promise<Request | null> {
    const entity = await this.demandeRepo.findOne({
      where: { id },
      relations: ['statutDemande'],
    });
    return entity ? RequestOrmMapper.toDomain(entity) : null;
  }

  async findPublished(options: {
    page: number;
    pageSize: number;
  }): Promise<PageResult<Request>> {
    const publishedStatusId =
      await this.statusLookup.getDemandeStatusId('PUBLISHED');

    const [entities, total] = await this.demandeRepo.findAndCount({
      where: { statutDemandeId: publishedStatusId },
      relations: ['statutDemande'],
      order: { dateMission: 'ASC' },
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
    });

    return {
      items: entities.map((entity) => RequestOrmMapper.toDomain(entity)),
      total,
      page: options.page,
      pageSize: options.pageSize,
    };
  }
}
