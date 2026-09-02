export interface UpsertAidantProfileCommand {
  userId: string;
  bio?: string;
  rayonIntervention: number;
}

export interface AidantProfileResult {
  id: number;
  userId: string;
  bio: string | null;
  rayonIntervention: number;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}
