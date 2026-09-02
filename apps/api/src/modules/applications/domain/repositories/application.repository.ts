import { Application } from '../entities/application.entity';
import { Request } from '@modules/requests/domain/entities/request.entity';
import { Mission } from '@modules/missions/domain/entities/mission.entity';
import { Participation } from '@modules/missions/domain/entities/participation.entity';
import type { PageResult } from '@shared/kernel/application/page-result';
import type { CandidatureStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export interface ApplicationWithContext {
  application: Application;
  request: Request;
  mission: Mission | null;
  participation: Participation | null;
}

export interface CandidateView {
  application: Application;
  aidant: {
    userId: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    rayonIntervention: number | null;
  };
}

export interface ApplicationRepository {
  save(application: Application): Promise<Application>;
  existsByDemandeAndAidant(demandeId: number, aidantId: string): Promise<boolean>;
  findById(id: number): Promise<Application | null>;
  findByAidantId(options: {
    aidantId: string;
    page: number;
    pageSize: number;
  }): Promise<PageResult<ApplicationWithContext>>;
  findByIdForAidant(
    id: number,
    aidantId: string,
  ): Promise<ApplicationWithContext | null>;
  findByDemandeId(demandeId: number): Promise<CandidateView[]>;
  countAccepted(demandeId: number): Promise<number>;
  findAcceptedByDemandeId(demandeId: number): Promise<Application[]>;
  refuseRemainingPending(demandeId: number, now: Date): Promise<void>;
  findStatusMapForAidant(
    demandeIds: number[],
    aidantId: string,
  ): Promise<Map<number, CandidatureStatusCode>>;
}
