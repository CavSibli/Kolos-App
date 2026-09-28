import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ collection: 'messages', timestamps: { createdAt: true, updatedAt: false } })
export class Message {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  conversationId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  missionId!: number;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  body!: string;

  createdAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, createdAt: 1 });
