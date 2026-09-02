import { ApplicationWithContext } from '../../domain/repositories/application.repository';
import { ApplicationWithContextResult } from '../dto/application.commands';
import { toRequestResult } from '@modules/requests/application/mappers/request-result.mapper';

export function toApplicationWithContextResult(
  context: ApplicationWithContext,
): ApplicationWithContextResult {
  return {
    id: context.application.id!,
    status: context.application.statusCode,
    message: context.application.message,
    prixPropose: context.application.prixPropose,
    createdAt: context.application.createdAt.toISOString(),
    request: toRequestResult(context.request),
    mission: context.mission
      ? {
          id: context.mission.id!,
          status: context.mission.statusCode,
          montantTotal: context.mission.montantTotal,
        }
      : null,
    participation: context.participation
      ? {
          id: context.participation.id!,
          status: context.participation.statusCode,
          montantConvenu: context.participation.montantConvenu,
        }
      : null,
  };
}
