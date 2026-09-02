import { Entity } from '@shared/kernel/domain/entity';
import type { ParticipationStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export interface ParticipationProps {
  id?: number;
  missionId: number;
  aidantId: string;
  candidatureId: number;
  statusCode: ParticipationStatusCode;
  montantConvenu: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Participation extends Entity<ParticipationProps> {
  get id(): number | undefined {
    return this.getProps().id;
  }

  get missionId(): number {
    return this.getProps().missionId;
  }

  get aidantId(): string {
    return this.getProps().aidantId;
  }

  get candidatureId(): number {
    return this.getProps().candidatureId;
  }

  get statusCode(): ParticipationStatusCode {
    return this.getProps().statusCode;
  }

  get montantConvenu(): number {
    return this.getProps().montantConvenu;
  }

  get createdAt(): Date {
    return this.getProps().createdAt;
  }

  get updatedAt(): Date {
    return this.getProps().updatedAt;
  }
}
