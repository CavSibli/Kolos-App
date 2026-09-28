import { Entity } from '@shared/kernel/domain/entity';

export type ReportMotifCode =
  | 'NO_SHOW'
  | 'DELAY'
  | 'NOT_PERFORMED'
  | 'BEHAVIOUR'
  | 'PAYMENT'
  | 'OTHER';

export type ReportStatusCode = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export type ReportPriorityCode = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface ReportProps {
  id?: number;
  missionId: number;
  auteurId: string;
  utilisateurSignaleId: string | null;
  motifCode: ReportMotifCode;
  statusCode: ReportStatusCode;
  priorityCode: ReportPriorityCode;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Report extends Entity<ReportProps> {
  static create(props: {
    missionId: number;
    auteurId: string;
    motifCode: ReportMotifCode;
    description: string;
    now: Date;
    utilisateurSignaleId?: string | null;
  }): Report {
    return new Report({
      missionId: props.missionId,
      auteurId: props.auteurId,
      utilisateurSignaleId: props.utilisateurSignaleId ?? null,
      motifCode: props.motifCode,
      statusCode: 'OPEN',
      priorityCode: 'NORMAL',
      description: props.description,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  get id(): number | undefined {
    return this.getProps().id;
  }

  get missionId(): number {
    return this.getProps().missionId;
  }

  get auteurId(): string {
    return this.getProps().auteurId;
  }

  get utilisateurSignaleId(): string | null {
    return this.getProps().utilisateurSignaleId;
  }

  get motifCode(): ReportMotifCode {
    return this.getProps().motifCode;
  }

  get statusCode(): ReportStatusCode {
    return this.getProps().statusCode;
  }

  get priorityCode(): ReportPriorityCode {
    return this.getProps().priorityCode;
  }

  get description(): string {
    return this.getProps().description;
  }

  get createdAt(): Date {
    return this.getProps().createdAt;
  }

  get updatedAt(): Date {
    return this.getProps().updatedAt;
  }

  applyStatus(statusCode: ReportStatusCode, now: Date): void {
    this.getProps().statusCode = statusCode;
    this.getProps().updatedAt = now;
  }
}
