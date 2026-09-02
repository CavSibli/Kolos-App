import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationRepository } from '../../domain/repositories/application.repository';
import { APPLICATION_REPOSITORY } from '../../applications.tokens';
import { ApplicationWithContextResult } from '../dto/application.commands';
import { toApplicationWithContextResult } from '../mappers/application-context.mapper';

@Injectable()
export class GetMyApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepository: ApplicationRepository,
  ) {}

  async execute(
    applicationId: number,
    aidantId: string,
  ): Promise<ApplicationWithContextResult> {
    const context = await this.applicationRepository.findByIdForAidant(
      applicationId,
      aidantId,
    );

    if (!context) {
      throw new NotFoundException('Candidature introuvable');
    }

    return toApplicationWithContextResult(context);
  }
}
