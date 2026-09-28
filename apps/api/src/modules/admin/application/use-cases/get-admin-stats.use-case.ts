import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { UserOrmEntity } from '@modules/identity/infrastructure/typeorm/entities/user.orm-entity';
import { DemandeOrmEntity } from '@modules/requests/infrastructure/typeorm/entities/demande.orm-entity';
import { MissionOrmEntity } from '@modules/missions/infrastructure/typeorm/entities/mission.orm-entity';
import { SignalementOrmEntity } from '@modules/reports/infrastructure/typeorm/entities/signalement.orm-entity';
import {
  Message,
  MessageDocument,
} from '@modules/messaging/infrastructure/mongo/schemas/message.schema';
import type { AdminStatsResult } from '../dto/admin-stats.dto';

@Injectable()
export class GetAdminStatsUseCase {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
    @InjectRepository(DemandeOrmEntity)
    private readonly demandes: Repository<DemandeOrmEntity>,
    @InjectRepository(MissionOrmEntity)
    private readonly missions: Repository<MissionOrmEntity>,
    @InjectRepository(SignalementOrmEntity)
    private readonly signalements: Repository<SignalementOrmEntity>,
    @InjectModel(Message.name)
    private readonly messages: Model<MessageDocument>,
  ) {}

  async execute(): Promise<AdminStatsResult> {
    const [
      usersTotal,
      requestsTotal,
      requestsByStatusRows,
      missionsTotal,
      reportsOpen,
      reportsTotal,
      messagesTotal,
    ] = await Promise.all([
      this.users.count(),
      this.demandes.count(),
      this.demandes
        .createQueryBuilder('d')
        .innerJoin('d.statutDemande', 's')
        .select('s.code', 'code')
        .addSelect('COUNT(*)', 'count')
        .groupBy('s.code')
        .getRawMany<{ code: string; count: string }>(),
      this.missions.count(),
      this.signalements
        .createQueryBuilder('sig')
        .innerJoin('sig.statutSignalement', 'st')
        .where('st.code = :code', { code: 'OPEN' })
        .getCount(),
      this.signalements.count(),
      this.messages.countDocuments().exec(),
    ]);

    const requestsByStatus: Record<string, number> = {};
    for (const row of requestsByStatusRows) {
      requestsByStatus[row.code] = Number(row.count);
    }

    return {
      usersTotal,
      requestsTotal,
      requestsByStatus,
      missionsTotal,
      reportsOpen,
      reportsTotal,
      messagesTotal,
    };
  }
}
