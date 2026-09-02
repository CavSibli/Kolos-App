import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { Entity } from '@shared/kernel/domain/entity';
import type { CandidatureStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';
import { Request } from '@modules/requests/domain/entities/request.entity';

export interface ApplicationProps {
  id?: number;
  demandeId: number;
  aidantId: string;
  statusCode: CandidatureStatusCode;
  message: string | null;
  prixPropose: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Application extends Entity<ApplicationProps> {
  static create(props: {
    request: Request;
    aidantId: string;
    message: string | null;
    prixPropose: number | null;
    now: Date;
  }): Application {
    if (props.request.statusCode !== 'PUBLISHED') {
      throw new UnprocessableEntityException(
        'Seules les demandes publiées acceptent des candidatures',
      );
    }

    if (props.request.demandeurId === props.aidantId) {
      throw new UnprocessableEntityException(
        'Vous ne pouvez pas candidater à votre propre demande',
      );
    }

    if (props.prixPropose !== null && props.prixPropose < 0) {
      throw new BadRequestException('Le prix proposé ne peut pas être négatif');
    }

    return new Application({
      demandeId: props.request.id!,
      aidantId: props.aidantId,
      statusCode: 'PENDING',
      message: props.message,
      prixPropose: props.prixPropose,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  get id(): number | undefined {
    return this.getProps().id;
  }

  get demandeId(): number {
    return this.getProps().demandeId;
  }

  get aidantId(): string {
    return this.getProps().aidantId;
  }

  get statusCode(): CandidatureStatusCode {
    return this.getProps().statusCode;
  }

  get message(): string | null {
    return this.getProps().message;
  }

  get prixPropose(): number | null {
    return this.getProps().prixPropose;
  }

  get createdAt(): Date {
    return this.getProps().createdAt;
  }

  get updatedAt(): Date {
    return this.getProps().updatedAt;
  }
}
