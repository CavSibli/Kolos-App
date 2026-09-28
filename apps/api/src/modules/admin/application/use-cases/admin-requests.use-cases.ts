import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST_REPOSITORY } from '@modules/requests/requests.tokens';
import type {
  RequestRepository,
  RequestWithStats,
} from '@modules/requests/domain/repositories/request.repository';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import { PublishRequestUseCase } from '@modules/requests/application/use-cases/publish-request.use-case';

function toAdminRequestItem(item: RequestWithStats) {
  const request = item.request;
  return {
    id: request.id!,
    demandeurId: request.demandeurId,
    status: request.statusCode,
    titre: request.titre,
    description: request.description,
    adresse: request.adresse,
    dateMission: request.dateMission.toISOString(),
    dureeEstimee: request.dureeEstimee,
    nbAidantsRequis: request.nbAidantsRequis,
    budgetEstime: request.budgetEstime,
    pendingApplications: item.pendingApplications,
    acceptedApplications: item.acceptedApplications,
    mission: item.mission?.id
      ? { id: item.mission.id, status: item.mission.statusCode }
      : null,
    createdAt: request.createdAt.toISOString(),
  };
}

@Injectable()
export class ListAdminRequestsUseCase {
  constructor(
    @Inject(REQUEST_REPOSITORY)
    private readonly requests: RequestRepository,
  ) {}

  async execute(query: { page?: number; pageSize?: number; status?: string }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const result = await this.requests.listForAdmin({
      page,
      pageSize,
      status: query.status,
    });
    return {
      items: result.items.map(toAdminRequestItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}

@Injectable()
export class GetAdminRequestUseCase {
  constructor(
    @Inject(REQUEST_REPOSITORY)
    private readonly requests: RequestRepository,
  ) {}

  async execute(id: number) {
    const listed = await this.requests.listForAdmin({
      page: 1,
      pageSize: 500,
    });
    const found = listed.items.find((item) => item.request.id === id);
    if (!found) {
      const request = await this.requests.findById(id);
      if (!request) throw new NotFoundException('Demande introuvable');
      return toAdminRequestItem({
        request,
        pendingApplications: 0,
        acceptedApplications: 0,
        mission: null,
      });
    }
    return toAdminRequestItem(found);
  }
}

@Injectable()
export class CreateAdminRequestUseCase {
  constructor(private readonly publishRequest: PublishRequestUseCase) {}

  async execute(command: {
    demandeurId: string;
    titre: string;
    description: string;
    adresse: string;
    dateMission: string;
    dureeEstimee: number;
    nbAidantsRequis: number;
    budgetEstime?: number | null;
    contraintesPhysiques?: string | null;
  }) {
    return this.publishRequest.execute({
      demandeurId: command.demandeurId,
      titre: command.titre,
      description: command.description,
      adresse: command.adresse,
      dateMission: command.dateMission,
      dureeEstimee: command.dureeEstimee,
      nbAidantsRequis: command.nbAidantsRequis,
      budgetEstime: command.budgetEstime ?? undefined,
      contraintesPhysiques: command.contraintesPhysiques ?? undefined,
    });
  }
}

@Injectable()
export class UpdateAdminRequestUseCase {
  constructor(
    @Inject(REQUEST_REPOSITORY)
    private readonly requests: RequestRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(
    id: number,
    command: {
      titre?: string;
      description?: string;
      adresse?: string;
      dateMission?: string;
      dureeEstimee?: number;
      nbAidantsRequis?: number;
      budgetEstime?: number | null;
      contraintesPhysiques?: string | null;
    },
  ) {
    // #region agent log
    try {
      const fs = await import('fs');
      fs.appendFileSync(
        'C:/Users/sibli.cav/OneDrive - Ouidou Consulting/Bureau/3WA-KOLOS/debug-081765.log',
        `${JSON.stringify({
          sessionId: '081765',
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'UpdateAdminRequestUseCase.execute',
          message: 'patch admin request entry',
          data: {
            id,
            keys: Object.keys(command).filter(
              (k) => (command as Record<string, unknown>)[k] !== undefined,
            ),
          },
          timestamp: Date.now(),
        })}\n`,
      );
    } catch {
      /* ignore */
    }
    // #endregion
    const request = await this.requests.findById(id);
    if (!request) throw new NotFoundException('Demande introuvable');
    if (request.statusCode === 'CANCELLED') {
      throw new BadRequestException('Demande déjà annulée');
    }
    const updated = await this.requests.save(
      request.withDetails(
        {
          titre: command.titre,
          description: command.description,
          adresse: command.adresse,
          dateMission: command.dateMission
            ? new Date(command.dateMission)
            : undefined,
          dureeEstimee: command.dureeEstimee,
          nbAidantsRequis: command.nbAidantsRequis,
          budgetEstime: command.budgetEstime,
          contraintesPhysiques: command.contraintesPhysiques,
        },
        this.clock.now(),
      ),
    );
    // #region agent log
    try {
      const fs = await import('fs');
      fs.appendFileSync(
        'C:/Users/sibli.cav/OneDrive - Ouidou Consulting/Bureau/3WA-KOLOS/debug-081765.log',
        `${JSON.stringify({
          sessionId: '081765',
          runId: 'pre-fix',
          hypothesisId: 'H4',
          location: 'UpdateAdminRequestUseCase.execute',
          message: 'patch admin request saved',
          data: { id: updated.id, titre: updated.titre, status: updated.statusCode },
          timestamp: Date.now(),
        })}\n`,
      );
    } catch {
      /* ignore */
    }
    // #endregion
    return {
      id: updated.id!,
      demandeurId: updated.demandeurId,
      status: updated.statusCode,
      titre: updated.titre,
      description: updated.description,
      adresse: updated.adresse,
      dateMission: updated.dateMission.toISOString(),
      dureeEstimee: updated.dureeEstimee,
      nbAidantsRequis: updated.nbAidantsRequis,
      budgetEstime: updated.budgetEstime,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}

@Injectable()
export class CancelAdminRequestUseCase {
  constructor(
    @Inject(REQUEST_REPOSITORY)
    private readonly requests: RequestRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(id: number) {
    const request = await this.requests.findById(id);
    if (!request) throw new NotFoundException('Demande introuvable');
    if (request.statusCode === 'CANCELLED') {
      throw new BadRequestException('Demande déjà annulée');
    }
    const updated = await this.requests.save(
      request.withStatus('CANCELLED', this.clock.now()),
    );
    return {
      id: updated.id!,
      status: updated.statusCode,
      titre: updated.titre,
    };
  }
}
