import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ModerationActionRepository,
  ModerationActionRecord,
} from '../../../domain/repositories/moderation-action.repository';
import {
  ModerationAction,
  ModerationActionDocument,
} from '../schemas/moderation-action.schema';

@Injectable()
export class MongooseModerationActionRepository
  implements ModerationActionRepository
{
  constructor(
    @InjectModel(ModerationAction.name)
    private readonly moderationActionModel: Model<ModerationActionDocument>,
  ) {}

  async insert(input: {
    reportId: number;
    adminId: string;
    action: string;
    reason: string | null;
    payload: Record<string, unknown> | null;
    createdAt: Date;
  }): Promise<ModerationActionRecord> {
    const created = await this.moderationActionModel.create({
      reportId: input.reportId,
      adminId: input.adminId,
      action: input.action,
      reason: input.reason,
      payload: input.payload,
      createdAt: input.createdAt,
    });

    return this.toRecord(created);
  }

  async listByReportId(reportId: number): Promise<ModerationActionRecord[]> {
    const docs = await this.moderationActionModel
      .find({ reportId })
      .sort({ createdAt: -1 })
      .exec();

    return docs.map((doc) => this.toRecord(doc));
  }

  async listRecent(limit = 50): Promise<ModerationActionRecord[]> {
    const docs = await this.moderationActionModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return docs.map((doc) => this.toRecord(doc));
  }

  private toRecord(doc: ModerationActionDocument): ModerationActionRecord {
    return {
      id: String(doc._id),
      reportId: doc.reportId,
      adminId: doc.adminId,
      action: doc.action,
      reason: doc.reason ?? null,
      payload: (doc.payload as Record<string, unknown> | null) ?? null,
      createdAt: doc.createdAt,
    };
  }
}
