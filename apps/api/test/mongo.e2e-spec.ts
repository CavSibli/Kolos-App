import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import {
  Conversation,
  ConversationDocument,
} from '../src/modules/messaging/infrastructure/mongo/schemas/conversation.schema';
import {
  Message,
  MessageDocument,
} from '../src/modules/messaging/infrastructure/mongo/schemas/message.schema';
import {
  ModerationAction,
  ModerationActionDocument,
} from '../src/modules/moderation/infrastructure/mongo/schemas/moderation-action.schema';

/**
 * E2E Mongo (T18) — preuves documentaires : assert collections réelles
 * après appels HTTP (messagerie + moderation_actions).
 */
describe('Mongo Option C (e2e)', () => {
  let app: INestApplication;
  let conversationModel: Model<ConversationDocument>;
  let messageModel: Model<MessageDocument>;
  let moderationModel: Model<ModerationActionDocument>;
  const suffix = Date.now();

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'Admin1234!';

  async function bootstrapMissionConfirmed(tag: string): Promise<{
    demandeurToken: string;
    aidantToken: string;
    missionId: number;
    requestId: number;
  }> {
    const demandeur = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: `mongo-${tag}-d-${suffix}@kolos.local`,
        password: 'Password123',
        firstName: 'Alice',
        lastName: 'Mongo',
        role: 'demandeur',
      })
      .expect(201);

    const aidant = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: `mongo-${tag}-a-${suffix}@kolos.local`,
        password: 'Password123',
        firstName: 'Bob',
        lastName: 'Mongo',
        role: 'aidant',
      })
      .expect(201);

    const demandeurToken = demandeur.body.accessToken as string;
    const aidantToken = aidant.body.accessToken as string;

    await request(app.getHttpServer())
      .patch('/v1/me/aidant-profile')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({ bio: 'Profil mongo', rayonIntervention: 20 })
      .expect(200);

    const published = await request(app.getHttpServer())
      .post('/v1/requests')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({
        titre: `Aide Mongo ${tag}`,
        description: 'Mission pour assert Mongo',
        adresse: 'Paris',
        dateMission: '2030-07-01T10:00:00.000Z',
        dureeEstimee: 60,
        nbAidantsRequis: 1,
        budgetEstime: 30,
      })
      .expect(201);

    const requestId = published.body.id as number;

    const application = await request(app.getHttpServer())
      .post('/v1/applications')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({
        demandeId: requestId,
        message: 'Dispo Mongo',
        prixPropose: 25,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/v1/applications/${application.body.id}/decision`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({ decision: 'ACCEPTED' })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/v1/requests/${requestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/payments/mock-authorize`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(201);

    return { demandeurToken, aidantToken, missionId, requestId };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    conversationModel = moduleFixture.get(getModelToken(Conversation.name));
    messageModel = moduleFixture.get(getModelToken(Message.name));
    moderationModel = moduleFixture.get(getModelToken(ModerationAction.name));
  });

  afterAll(async () => {
    await app.close();
  });

  it('persists conversation + message documents after POST messages', async () => {
    const { demandeurToken, missionId } =
      await bootstrapMissionConfirmed('msg');

    const created = await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({ body: 'Hello Mongo T18' })
      .expect(201);

    expect(created.body.body).toBe('Hello Mongo T18');
    expect(created.body.missionId).toBe(missionId);

    const conversation = await conversationModel.findOne({ missionId }).exec();
    expect(conversation).not.toBeNull();
    expect(conversation!.participantIds.length).toBeGreaterThanOrEqual(2);

    const message = await messageModel
      .findOne({ missionId, body: 'Hello Mongo T18' })
      .exec();
    expect(message).not.toBeNull();
    expect(message!.userId).toBeTruthy();
    expect(String(message!.conversationId)).toBe(String(conversation!._id));
  });

  it('persists moderation_actions document after admin MASK', async () => {
    const { demandeurToken, missionId } =
      await bootstrapMissionConfirmed('mod');

    const report = await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/reports`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({
        motif: 'OTHER',
        description: 'Signalement pour assert Mongo MASK',
      })
      .expect(201);

    const reportId = report.body.id as number;

    const adminLogin = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);

    const action = await request(app.getHttpServer())
      .post(`/v1/admin/reports/${reportId}/actions`)
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
      .send({ action: 'MASK', reason: 'Contenu masqué T18' })
      .expect(201);

    expect(action.body.action).toBe('MASK');

    const mongoDoc = await moderationModel
      .findOne({ reportId, action: 'MASK' })
      .sort({ createdAt: -1 })
      .exec();

    expect(mongoDoc).not.toBeNull();
    expect(mongoDoc!.reportId).toBe(reportId);
    expect(mongoDoc!.action).toBe('MASK');
    expect(mongoDoc!.reason).toBe('Contenu masqué T18');
    expect(mongoDoc!.adminId).toBeTruthy();
  });
});
