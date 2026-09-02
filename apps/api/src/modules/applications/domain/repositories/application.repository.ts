import { Application } from '../entities/application.entity';

export interface ApplicationRepository {
  save(application: Application): Promise<Application>;
  existsByDemandeAndAidant(demandeId: number, aidantId: string): Promise<boolean>;
}
