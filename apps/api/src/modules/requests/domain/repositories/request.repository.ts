import { Request } from '../entities/request.entity';
import type { PageResult } from '@shared/kernel/application/page-result';
import type { CandidatureStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';
import { Mission } from '@modules/missions/domain/entities/mission.entity';

export interface FindPublishedOptions {
  page: number;
  pageSize: number;
  aidantId?: string;
}

export interface PublishedRequestItem {
  request: Request;
  myApplicationStatus: CandidatureStatusCode | null;
}

export interface RequestWithStats {
  request: Request;
  pendingApplications: number;
  acceptedApplications: number;
  mission: Mission | null;
}

export interface RequestRepository {
  save(request: Request): Promise<Request>;
  findById(id: number): Promise<Request | null>;
  findPublished(
    options: FindPublishedOptions,
  ): Promise<PageResult<PublishedRequestItem>>;
  findByDemandeurId(options: {
    demandeurId: string;
    page: number;
    pageSize: number;
  }): Promise<PageResult<RequestWithStats>>;
}
