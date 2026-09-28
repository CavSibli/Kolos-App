export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  REFUSED: 'Refusée',
  WITHDRAWN: 'Retirée',
  PUBLISHED: 'Publiée',
  PARTIALLY_ASSIGNED: 'Partiellement assignée',
  ASSIGNED: 'Assignée',
  AWAITING_PAYMENT: 'En attente de paiement',
  CONFIRMED: 'Confirmée',
  SELECTED: 'Sélectionné',
  COMPLETED: 'Terminée',
};

const STATUS_TONES: Record<string, BadgeTone> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REFUSED: 'danger',
  WITHDRAWN: 'neutral',
  PUBLISHED: 'neutral',
  PARTIALLY_ASSIGNED: 'warning',
  ASSIGNED: 'success',
  AWAITING_PAYMENT: 'warning',
  CONFIRMED: 'success',
  SELECTED: 'success',
  COMPLETED: 'success',
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function statusTone(status: string): BadgeTone {
  return STATUS_TONES[status] ?? 'neutral';
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('fr-FR');
}
