import { AidantProfile } from '../entities/aidant-profile.entity';

export interface AidantProfileRepository {
  findByUserId(userId: string): Promise<AidantProfile | null>;
  save(profile: AidantProfile): Promise<AidantProfile>;
}
