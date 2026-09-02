export interface ApplyToRequestCommand {
  aidantId: string;
  demandeId: number;
  message?: string;
  prixPropose?: number;
}

export interface ApplicationResult {
  id: number;
  demandeId: number;
  aidantId: string;
  status: string;
  message: string | null;
  prixPropose: number | null;
  createdAt: string;
}
