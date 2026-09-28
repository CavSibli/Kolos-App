import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ collection: 'conversations', timestamps: true })
export class Conversation {
  @Prop({ required: true, unique: true, index: true })
  missionId!: number;

  @Prop({ type: [String], required: true })
  participantIds!: string[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
