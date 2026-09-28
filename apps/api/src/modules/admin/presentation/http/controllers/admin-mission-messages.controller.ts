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
import { ListMessagesUseCase } from '@modules/messaging/application/use-cases/list-messages.use-case';
import { PostMessageUseCase } from '@modules/messaging/application/use-cases/post-message.use-case';
import { PostMessageDto } from '@modules/messaging/presentation/http/dto/message.dto';
import type { MissionMessageResponse } from '@kolos/shared-types';

@Controller('admin/missions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminMissionMessagesController {
  constructor(
    private readonly listMessagesUseCase: ListMessagesUseCase,
    private readonly postMessageUseCase: PostMessageUseCase,
  ) {}

  @Get(':id/messages')
  async listMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MissionMessageResponse[]> {
    return this.listMessagesUseCase.execute({
      missionId: id,
      userId: user.userId,
      asAdmin: true,
    });
  }

  @Post(':id/messages')
  async postMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostMessageDto,
  ): Promise<MissionMessageResponse> {
    return this.postMessageUseCase.execute({
      missionId: id,
      userId: user.userId,
      body: dto.body,
      asAdmin: true,
    });
  }
}
