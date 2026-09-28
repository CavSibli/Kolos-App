import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type ModerationActionDocument = HydratedDocument<ModerationAction>;

@Schema({
  collection: 'moderation_actions',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ModerationAction {
  @Prop({ required: true, index: true })
  reportId!: number;

  @Prop({ required: true, index: true })
  adminId!: string;

  @Prop({ required: true, trim: true })
  action!: string;

  @Prop({ type: String, default: null })
  reason!: string | null;

  @Prop({ type: SchemaTypes.Mixed, default: null })
  payload!: Record<string, unknown> | null;

  createdAt!: Date;
}

export const ModerationActionSchema =
  SchemaFactory.createForClass(ModerationAction);
ModerationActionSchema.index({ reportId: 1, createdAt: -1 });
