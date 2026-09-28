import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import {
  ModerationAction,
  ModerationActionDocument,
} from '../src/modules/moderation/infrastructure/mongo/schemas/moderation-action.schema';

describe('Admin moderation action → Mongo (e2e)', () => {
  let app: INestApplication;
  let moderationModel: Model<ModerationActionDocument>;
  const suffix = Date.now();
  const demandeurEmail = `demandeur-mod-${suffix}@kolos.local`;
  const aidantEmail = `aidant-mod-${suffix}@kolos.local`;
  let demandeurToken = '';
  let aidantToken = '';
  let adminToken = '';
  let reportId = 0;

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'Admin1234!';

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

    moderationModel = moduleFixture.get(
      getModelToken(ModerationAction.name),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('prepares mission + report then admin CLASSIFY writes Mongo', async () => {
    const demandeur = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: demandeurEmail,
        password: 'Password123',
        firstName: 'Alice',
        lastName: 'Demandeur',
        role: 'demandeur',
      })
      .expect(201);
    demandeurToken = demandeur.body.accessToken;

    const aidant = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: aidantEmail,
        password: 'Password123',
        firstName: 'Bob',
        lastName: 'Aidant',
        role: 'aidant',
      })
      .expect(201);
    aidantToken = aidant.body.accessToken;

    await request(app.getHttpServer())
      .patch('/v1/me/aidant-profile')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({ bio: 'Profil test', rayonIntervention: 20 })
      .expect(200);

    const published = await request(app.getHttpServer())
      .post('/v1/requests')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({
        titre: 'Aide courses T14',
        description: 'Courses pour test moderation',
        adresse: 'Paris',
        dateMission: '2030-06-01T10:00:00.000Z',
        dureeEstimee: 60,
        nbAidantsRequis: 1,
      })
      .expect(201);

    const requestId = published.body.id as number;

    const application = await request(app.getHttpServer())
      .post('/v1/applications')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({
        demandeId: requestId,
        message: 'Disponible pour T14',
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

    const report = await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/reports`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({
        motif: 'NO_SHOW',
        description: 'Signalement pour action admin T14',
      })
      .expect(201);

    reportId = report.body.id as number;

    const adminLogin = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    await request(app.getHttpServer())
      .post(`/v1/admin/reports/${reportId}/actions`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({ action: 'CLASSIFY', reason: 'Tentative non-admin' })
      .expect(403);

    const response = await request(app.getHttpServer())
      .post(`/v1/admin/reports/${reportId}/actions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'CLASSIFY', reason: 'Signalement fondé' })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        reportId,
        action: 'CLASSIFY',
        reportStatus: 'RESOLVED',
        reason: 'Signalement fondé',
      }),
    );
    expect(response.body.id).toBeTruthy();

    const mongoDoc = await moderationModel
      .findOne({ reportId, action: 'CLASSIFY' })
      .sort({ createdAt: -1 })
      .exec();

    expect(mongoDoc).not.toBeNull();
    expect(mongoDoc!.reportId).toBe(reportId);
    expect(mongoDoc!.action).toBe('CLASSIFY');
    expect(mongoDoc!.payload).toEqual(
      expect.objectContaining({
        previousStatus: 'OPEN',
        nextStatus: 'RESOLVED',
        source: 'admin',
      }),
    );

    const list = await request(app.getHttpServer())
      .get('/v1/admin/reports')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const item = list.body.items.find(
      (entry: { id: number }) => entry.id === reportId,
    );
    expect(item?.status).toBe('RESOLVED');
  });
});
