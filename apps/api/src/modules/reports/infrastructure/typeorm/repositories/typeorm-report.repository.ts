import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportRepository } from '../../../domain/repositories/report.repository';
import { Report } from '../../../domain/entities/report.entity';
import { SignalementOrmEntity } from '../entities/signalement.orm-entity';
import { ReportOrmMapper } from '../mappers/report.orm-mapper';
import { TypeSignalementOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/type-signalement.orm-entity';
import { StatutSignalementOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/statut-signalement.orm-entity';
import { PrioriteSignalementOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/priorite-signalement.orm-entity';

@Injectable()
export class TypeOrmReportRepository implements ReportRepository {
  constructor(
    @InjectRepository(SignalementOrmEntity)
    private readonly signalementRepo: Repository<SignalementOrmEntity>,
    @InjectRepository(TypeSignalementOrmEntity)
    private readonly typeRepo: Repository<TypeSignalementOrmEntity>,
    @InjectRepository(StatutSignalementOrmEntity)
    private readonly statutRepo: Repository<StatutSignalementOrmEntity>,
    @InjectRepository(PrioriteSignalementOrmEntity)
    private readonly prioriteRepo: Repository<PrioriteSignalementOrmEntity>,
  ) {}

  async save(report: Report): Promise<Report> {
    const typeId = await this.resolveRefId(
      this.typeRepo,
      report.motifCode,
      'type signalement',
    );
    const statutId = await this.resolveRefId(
      this.statutRepo,
      report.statusCode,
      'statut signalement',
    );
    const prioriteId = await this.resolveRefId(
      this.prioriteRepo,
      report.priorityCode,
      'priorité signalement',
    );

    const created = this.signalementRepo.create({
      missionId: report.missionId,
      auteurId: report.auteurId,
      utilisateurSignaleId: report.utilisateurSignaleId,
      typeSignalementId: typeId,
      statutSignalementId: statutId,
      prioriteSignalementId: prioriteId,
      description: report.description,
      dateCreation: report.createdAt,
      dateMaj: report.updatedAt,
    });

    const saved = await this.signalementRepo.save(created);
    const reloaded = await this.signalementRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['typeSignalement', 'statutSignalement', 'prioriteSignalement'],
    });

    return ReportOrmMapper.toDomain(reloaded);
  }

  private async resolveRefId(
    repo: Repository<{ id: number; code: string }>,
    code: string,
    label: string,
  ): Promise<number> {
    const entity = await repo.findOne({ where: { code } });
    if (!entity) {
      throw new NotFoundException(`${label} code ${code} introuvable`);
    }
    return entity.id;
  }
}
