import { AidantProfile } from '../../../domain/entities/aidant-profile.entity';
import { RayonIntervention } from '../../../domain/value-objects/rayon-intervention.vo';
import { ProfilAidantOrmEntity } from '../entities/profil-aidant.orm-entity';
import type { VerificationStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export class AidantProfileOrmMapper {
  static toDomain(entity: ProfilAidantOrmEntity): AidantProfile {
    return new AidantProfile({
      id: entity.id,
      userId: entity.userId,
      bio: entity.bio,
      rayonIntervention: RayonIntervention.create(entity.rayonIntervention),
      verificationStatusCode: entity.statutVerification
        .code as VerificationStatusCode,
      verifiedAt: entity.dateIdentiteVerifiee,
      createdAt: entity.dateCreation,
      updatedAt: entity.dateMaj,
    });
  }

  static toOrm(
    profile: AidantProfile,
    statutVerificationId: number,
  ): Partial<ProfilAidantOrmEntity> {
    return {
      id: profile.id,
      userId: profile.userId,
      statutVerificationId,
      bio: profile.bio,
      rayonIntervention: profile.rayonIntervention.toNumber(),
      dateIdentiteVerifiee: profile.verifiedAt,
      dateCreation: profile.createdAt,
      dateMaj: profile.updatedAt,
    };
  }
}
