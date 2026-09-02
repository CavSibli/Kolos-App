import { Entity } from '@shared/kernel/domain/entity';
import type { MissionStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export interface MissionProps {
  id?: number;
  demandeId: number;
  statusCode: MissionStatusCode;
  montantTotal: number;
  dateDebut: Date | null;
  dateFin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Mission extends Entity<MissionProps> {
  get id(): number | undefined {
    return this.getProps().id;
  }

  get demandeId(): number {
    return this.getProps().demandeId;
  }

  get statusCode(): MissionStatusCode {
    return this.getProps().statusCode;
  }

  get montantTotal(): number {
    return this.getProps().montantTotal;
  }

  get dateDebut(): Date | null {
    return this.getProps().dateDebut;
  }

  get dateFin(): Date | null {
    return this.getProps().dateFin;
  }

  get createdAt(): Date {
    return this.getProps().createdAt;
  }

  get updatedAt(): Date {
    return this.getProps().updatedAt;
  }
}
