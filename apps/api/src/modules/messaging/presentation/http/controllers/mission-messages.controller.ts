import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { RolesGuard } from '@shared/auth/roles.guard';
import { Roles } from '@shared/auth/roles.decorator';
import { CurrentUser } from '@shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '@shared/auth/current-user.decorator';
import { ListMessagesUseCase } from '../../../application/use-cases/list-messages.use-case';
import { PostMessageUseCase } from '../../../application/use-cases/post-message.use-case';
import { PostMessageDto } from '../dto/message.dto';
import type { MissionMessageResponse } from '@kolos/shared-types';

@Controller('missions')
export class MissionMessagesController {
  constructor(
    private readonly listMessagesUseCase: ListMessagesUseCase,
    private readonly postMessageUseCase: PostMessageUseCase,
  ) {}

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('demandeur', 'aidant')
  async listMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MissionMessageResponse[]> {
    return this.listMessagesUseCase.execute({
      missionId: id,
      userId: user.userId,
    });
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('demandeur', 'aidant')
  async postMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostMessageDto,
  ): Promise<MissionMessageResponse> {
    return this.postMessageUseCase.execute({
      missionId: id,
      userId: user.userId,
      body: dto.body,
    });
  }
}
