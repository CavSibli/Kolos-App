import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose, { Schema, Types } from 'mongoose';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

const ConversationSchema = new Schema(
  {
    missionId: { type: Number, required: true, unique: true },
    participantIds: { type: [String], required: true },
  },
  { collection: 'conversations', timestamps: true },
);

const MessageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, required: true },
    missionId: { type: Number, required: true },
    userId: { type: String, required: true },
    body: { type: String, required: true },
  },
  { collection: 'messages', timestamps: { createdAt: true, updatedAt: false } },
);

async function seedMessages() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DB_NAME ?? 'kolos_business';
  const missionId = Number(process.env.MONGO_SEED_MISSION_ID ?? 1);
  const demandeurId =
    process.env.MONGO_SEED_DEMANDEUR_ID ??
    '00000000-0000-4000-8000-000000000001';
  const aidantId =
    process.env.MONGO_SEED_AIDANT_ID ?? '00000000-0000-4000-8000-000000000002';

  await mongoose.connect(uri, { dbName });

  const Conversation = mongoose.model('ConversationSeed', ConversationSchema);
  const Message = mongoose.model('MessageSeed', MessageSchema);

  const existing = await Conversation.findOne({ missionId }).exec();
  if (existing) {
    console.log(
      `Conversation already exists for missionId=${missionId}, skipping seed.`,
    );
    await mongoose.disconnect();
    return;
  }

  const conversation = await Conversation.create({
    missionId,
    participantIds: [demandeurId, aidantId],
  });

  await Message.create([
    {
      conversationId: conversation._id as Types.ObjectId,
      missionId,
      userId: demandeurId,
      body: 'Bonjour, merci d’avoir accepté la mission courses.',
    },
    {
      conversationId: conversation._id as Types.ObjectId,
      missionId,
      userId: aidantId,
      body: 'Bonjour, je confirme mon arrivée vers 14h devant le magasin.',
    },
  ]);

  console.log(
    `Mongo messaging seeded: conversation ${String(conversation._id)} for mission ${missionId}`,
  );
  await mongoose.disconnect();
}

seedMessages().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
