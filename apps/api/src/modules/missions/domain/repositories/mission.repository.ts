import { Mission } from '../entities/mission.entity';
import { Participation } from '../entities/participation.entity';
import { Application } from '@modules/applications/domain/entities/application.entity';

export interface CreateMissionWithParticipantsInput {
  demandeId: number;
  acceptedApplications: Application[];
  now: Date;
}

export interface CreateMissionWithParticipantsResult {
  mission: Mission;
  participations: Participation[];
}

export interface MissionRepository {
  findById(id: number): Promise<Mission | null>;
  findByDemandeId(demandeId: number): Promise<Mission | null>;
  findParticipationByMissionAndAidant(
    missionId: number,
    aidantId: string,
  ): Promise<Participation | null>;
  save(mission: Mission): Promise<Mission>;
  createWithParticipants(
    input: CreateMissionWithParticipantsInput,
  ): Promise<CreateMissionWithParticipantsResult>;
}
