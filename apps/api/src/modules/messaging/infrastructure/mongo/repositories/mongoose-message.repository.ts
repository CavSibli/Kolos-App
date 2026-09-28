import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MessageRepository,
  MessageRecord,
} from '../../../domain/repositories/message.repository';
import { Message, MessageDocument } from '../schemas/message.schema';

@Injectable()
export class MongooseMessageRepository implements MessageRepository {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async listByConversationId(
    conversationId: string,
  ): Promise<MessageRecord[]> {
    const docs = await this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .exec();

    return docs.map((doc) => this.toRecord(doc));
  }

  async insert(input: {
    conversationId: string;
    missionId: number;
    userId: string;
    body: string;
    createdAt: Date;
  }): Promise<MessageRecord> {
    const created = await this.messageModel.create({
      conversationId: new Types.ObjectId(input.conversationId),
      missionId: input.missionId,
      userId: input.userId,
      body: input.body,
      createdAt: input.createdAt,
    });

    return this.toRecord(created);
  }

  private toRecord(doc: MessageDocument): MessageRecord {
    return {
      id: String(doc._id),
      conversationId: String(doc.conversationId),
      missionId: doc.missionId,
      userId: doc.userId,
      body: doc.body,
      createdAt: doc.createdAt,
    };
  }
}
