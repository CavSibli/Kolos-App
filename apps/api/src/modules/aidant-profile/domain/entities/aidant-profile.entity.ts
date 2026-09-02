import { Entity } from '@shared/kernel/domain/entity';
import { RayonIntervention } from '../value-objects/rayon-intervention.vo';
import type { VerificationStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export interface AidantProfileProps {
  id?: number;
  userId: string;
  bio: string | null;
  rayonIntervention: RayonIntervention;
  verificationStatusCode: VerificationStatusCode;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AidantProfile extends Entity<AidantProfileProps> {
  static create(props: {
    userId: string;
    bio: string | null;
    rayonIntervention: RayonIntervention;
    now: Date;
  }): AidantProfile {
    return new AidantProfile({
      userId: props.userId,
      bio: props.bio,
      rayonIntervention: props.rayonIntervention,
      verificationStatusCode: 'NOT_VERIFIED',
      verifiedAt: null,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  get id(): number | undefined {
    return this.getProps().id;
  }

  get userId(): string {
    return this.getProps().userId;
  }

  get bio(): string | null {
    return this.getProps().bio;
  }

  get rayonIntervention(): RayonIntervention {
    return this.getProps().rayonIntervention;
  }

  get verificationStatusCode(): VerificationStatusCode {
    return this.getProps().verificationStatusCode;
  }

  get verifiedAt(): Date | null {
    return this.getProps().verifiedAt;
  }

  get createdAt(): Date {
    return this.getProps().createdAt;
  }

  get updatedAt(): Date {
    return this.getProps().updatedAt;
  }

  update(props: {
    bio: string | null;
    rayonIntervention: RayonIntervention;
    now: Date;
  }): AidantProfile {
    return new AidantProfile({
      ...this.getProps(),
      bio: props.bio,
      rayonIntervention: props.rayonIntervention,
      updatedAt: props.now,
    });
  }
}
