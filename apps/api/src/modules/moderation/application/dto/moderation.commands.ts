export type ModerationActionCode = 'MASK' | 'CLASSIFY' | 'DISMISS';

export const MODERATION_ACTION_CODES: readonly ModerationActionCode[] = [
  'MASK',
  'CLASSIFY',
  'DISMISS',
] as const;

export interface CreateModerationActionCommand {
  reportId: number;
  adminId: string;
  action: string;
  reason?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface ListModerationActionsCommand {
  reportId?: number;
  limit?: number;
}

export interface ModerationActionResult {
  id: string;
  reportId: number;
  adminId: string;
  action: string;
  reason: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
}
