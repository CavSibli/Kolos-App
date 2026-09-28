import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin mission messages (e2e)', () => {
  let app: INestApplication;
  const suffix = Date.now();
  const demandeurEmail = `admin-msg-d-${suffix}@kolos.local`;
  const aidantEmail = `admin-msg-a-${suffix}@kolos.local`;
  let demandeurToken = '';
  let aidantToken = '';
  let adminToken = '';
  let missionId = 0;
  let requestId = 0;
  let applicationId = 0;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets admin list/post messages; non-admin forbidden on admin routes', async () => {
    const demandeur = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: demandeurEmail,
        password: 'Password123',
        firstName: 'Alice',
        lastName: 'Msg',
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
        lastName: 'Msg',
        role: 'aidant',
      })
      .expect(201);
    aidantToken = aidant.body.accessToken;

    await request(app.getHttpServer())
      .patch('/v1/me/aidant-profile')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({ bio: 'Profil', rayonIntervention: 15 })
      .expect(200);

    const published = await request(app.getHttpServer())
      .post('/v1/requests')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({
        titre: 'Aide admin msg',
        description: 'Pour messagerie admin',
        adresse: 'Paris',
        dateMission: '2031-06-15T10:00:00.000Z',
        dureeEstimee: 60,
        nbAidantsRequis: 1,
        budgetEstime: 20,
      })
      .expect(201);
    requestId = published.body.id;

    const applied = await request(app.getHttpServer())
      .post('/v1/applications')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({ demandeId: requestId, message: 'Dispo', prixPropose: 18 })
      .expect(201);
    applicationId = applied.body.id;

    await request(app.getHttpServer())
      .post(`/v1/applications/${applicationId}/decision`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({ decision: 'ACCEPTED' })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/v1/requests/${requestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);
    missionId = detail.body.mission.id;

    await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/payments/mock-authorize`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .get(`/v1/admin/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(403);

    const adminLogin = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    const listed = await request(app.getHttpServer())
      .get(`/v1/admin/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(listed.body)).toBe(true);

    const posted = await request(app.getHttpServer())
      .post(`/v1/admin/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ body: 'Message de modération admin.' })
      .expect(201);

    expect(posted.body.missionId).toBe(missionId);
    expect(posted.body.body).toContain('modération');
    expect(posted.body.userId).toBeTruthy();

    const after = await request(app.getHttpServer())
      .get(`/v1/admin/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      after.body.some((m: { body: string }) => m.body.includes('modération')),
    ).toBe(true);
  });
});
