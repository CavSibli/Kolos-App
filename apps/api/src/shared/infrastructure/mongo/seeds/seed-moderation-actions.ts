import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose, { Schema } from 'mongoose';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

const ModerationActionSchema = new Schema(
  {
    reportId: { type: Number, required: true, index: true },
    adminId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    reason: { type: String, default: null },
    payload: { type: Schema.Types.Mixed, default: null },
  },
  {
    collection: 'moderation_actions',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

async function seedModerationActions() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DB_NAME ?? 'kolos_business';
  const reportId = Number(process.env.MONGO_SEED_REPORT_ID ?? 1);
  const adminId =
    process.env.MONGO_SEED_ADMIN_ID ?? '00000000-0000-4000-8000-000000000099';

  await mongoose.connect(uri, { dbName });

  const ModerationAction = mongoose.model(
    'ModerationActionSeed',
    ModerationActionSchema,
  );

  const existing = await ModerationAction.findOne({
    reportId,
    action: 'CLASSIFY',
  }).exec();
  if (existing) {
    console.log(
      `Moderation action already exists for reportId=${reportId}, skipping seed.`,
    );
    await mongoose.disconnect();
    return;
  }

  const created = await ModerationAction.create({
    reportId,
    adminId,
    action: 'CLASSIFY',
    reason: 'Démo T12 — signalement classé sans suite UI admin (T13).',
    payload: {
      source: 'seed:mongo',
      previousStatus: 'OPEN',
      nextStatus: 'RESOLVED',
    },
  });

  console.log(
    `Mongo moderation_actions seeded: ${String(created._id)} for reportId=${reportId}`,
  );
  await mongoose.disconnect();
}

seedModerationActions().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
