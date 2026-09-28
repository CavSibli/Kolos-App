import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConversationRepository,
  ConversationRecord,
} from '../../../domain/repositories/conversation.repository';
import {
  Conversation,
  ConversationDocument,
} from '../schemas/conversation.schema';

@Injectable()
export class MongooseConversationRepository implements ConversationRepository {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findByMissionId(missionId: number): Promise<ConversationRecord | null> {
    const doc = await this.conversationModel.findOne({ missionId }).exec();
    return doc ? this.toRecord(doc) : null;
  }

  async getOrCreate(
    missionId: number,
    participantIds: string[],
  ): Promise<ConversationRecord> {
    const uniqueParticipants = [...new Set(participantIds)];
    const doc = await this.conversationModel
      .findOneAndUpdate(
        { missionId },
        {
          $setOnInsert: {
            missionId,
            participantIds: uniqueParticipants,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    return this.toRecord(doc);
  }

  private toRecord(doc: ConversationDocument): ConversationRecord {
    return {
      id: String(doc._id),
      missionId: doc.missionId,
      participantIds: doc.participantIds,
      createdAt: doc.createdAt,
    };
  }
}
