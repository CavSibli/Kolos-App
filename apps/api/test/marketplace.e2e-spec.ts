import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Marketplace (e2e)', () => {
  let app: INestApplication;
  const suffix = Date.now();
  const demandeurEmail = `demandeur-${suffix}@kolos.local`;
  const aidantEmail = `aidant-${suffix}@kolos.local`;
  let demandeurToken = '';
  let aidantToken = '';
  let publishedRequestId = 0;
  let applicationId = 0;

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

  it('registers demandeur and aidant accounts', async () => {
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
  });

  it('creates aidant profile', async () => {
    await request(app.getHttpServer())
      .patch('/v1/me/aidant-profile')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({ bio: 'Profil test', rayonIntervention: 20 })
      .expect(200);
  });

  it('publishes a request as demandeur', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/requests')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({
        titre: 'Aide courses',
        description: 'Besoin d aide pour faire les courses',
        adresse: '12 avenue de la République, Paris',
        dateMission: '2030-06-15T10:00:00.000Z',
        dureeEstimee: 90,
        nbAidantsRequis: 1,
        budgetEstime: 30,
      })
      .expect(201);

    expect(response.body.status).toBe('PUBLISHED');
    publishedRequestId = response.body.id;
  });

  it('lists published requests as aidant', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/requests?status=PUBLISHED')
      .set('Authorization', `Bearer ${aidantToken}`)
      .expect(200);

    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.items[0].status).toBe('PUBLISHED');
  });

  it('applies to a request as aidant', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/applications')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({
        demandeId: publishedRequestId,
        message: 'Je suis disponible',
        prixPropose: 25,
      })
      .expect(201);

    expect(response.body.status).toBe('PENDING');
    applicationId = response.body.id;
  });

  it('rejects duplicate application', async () => {
    await request(app.getHttpServer())
      .post('/v1/applications')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({ demandeId: publishedRequestId })
      .expect(409);
  });

  it('forbids demandeur from applying', async () => {
    await request(app.getHttpServer())
      .post('/v1/applications')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({ demandeId: publishedRequestId })
      .expect(403);
  });

  it('forbids aidant from publishing', async () => {
    await request(app.getHttpServer())
      .post('/v1/requests')
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({
        titre: 'Tentative',
        description: 'Description',
        adresse: 'Paris',
        dateMission: '2030-06-15T10:00:00.000Z',
        dureeEstimee: 60,
        nbAidantsRequis: 1,
      })
      .expect(403);
  });

  it('lists my applications as aidant with context', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/applications/me')
      .set('Authorization', `Bearer ${aidantToken}`)
      .expect(200);

    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.items[0].request.id).toBe(publishedRequestId);
    expect(response.body.items[0].status).toBe('PENDING');
  });

  it('lists my requests as demandeur', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/requests/mine')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.items[0].pendingApplications).toBeGreaterThanOrEqual(1);
  });

  it('lists candidates for demandeur request', async () => {
    const response = await request(app.getHttpServer())
      .get(`/v1/requests/${publishedRequestId}/applications`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].status).toBe('PENDING');
  });

  it('accepts candidate and creates mission', async () => {
    const response = await request(app.getHttpServer())
      .post(`/v1/applications/${applicationId}/decision`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({ decision: 'ACCEPTED' })
      .expect(201);

    expect(response.body.status).toBe('ACCEPTED');
    expect(response.body.requestStatus).toBe('ASSIGNED');
    expect(response.body.mission.status).toBe('AWAITING_PAYMENT');
  });

  it('shows mission on aidant application detail', async () => {
    const response = await request(app.getHttpServer())
      .get(`/v1/applications/me/${applicationId}`)
      .set('Authorization', `Bearer ${aidantToken}`)
      .expect(200);

    expect(response.body.status).toBe('ACCEPTED');
    expect(response.body.mission.status).toBe('AWAITING_PAYMENT');
    expect(response.body.participation.status).toBe('SELECTED');
  });

  it('authorizes mock payment as mission owner', async () => {
    const detail = await request(app.getHttpServer())
      .get(`/v1/requests/${publishedRequestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    const response = await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/payments/mock-authorize`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(201);

    expect(response.body.missionId).toBe(missionId);
    expect(response.body.status).toBe('CONFIRMED');
    expect(response.body.montantTotal).toBeGreaterThan(0);

    const after = await request(app.getHttpServer())
      .get(`/v1/requests/${publishedRequestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    expect(after.body.mission.status).toBe('CONFIRMED');
  });

  it('forbids mock payment for non-owner demandeur', async () => {
    const other = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: `demandeur-other-${suffix}@kolos.local`,
        password: 'Password123',
        firstName: 'Carol',
        lastName: 'Other',
        role: 'demandeur',
      })
      .expect(201);

    const otherToken = other.body.accessToken as string;

    const detail = await request(app.getHttpServer())
      .get(`/v1/applications/me/${applicationId}`)
      .set('Authorization', `Bearer ${aidantToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/payments/mock-authorize`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });

  it('creates a report as mission demandeur', async () => {
    const detail = await request(app.getHttpServer())
      .get(`/v1/requests/${publishedRequestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    const response = await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/reports`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({
        motif: 'NO_SHOW',
        description: 'Aidant non présent au rendez-vous',
      })
      .expect(201);

    expect(response.body.id).toBeGreaterThan(0);
    expect(response.body.missionId).toBe(missionId);
    expect(response.body.motif).toBe('NO_SHOW');
    expect(response.body.status).toBe('OPEN');
  });

  it('creates a report as mission aidant', async () => {
    const detail = await request(app.getHttpServer())
      .get(`/v1/applications/me/${applicationId}`)
      .set('Authorization', `Bearer ${aidantToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    const response = await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/reports`)
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({
        motif: 'PAYMENT',
        description: 'Problème sur le paiement simulé',
      })
      .expect(201);

    expect(response.body.status).toBe('OPEN');
    expect(response.body.motif).toBe('PAYMENT');
  });

  it('rejects report without auth', async () => {
    const detail = await request(app.getHttpServer())
      .get(`/v1/requests/${publishedRequestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/reports`)
      .send({ motif: 'OTHER', description: 'Sans token' })
      .expect(401);
  });

  it('forbids report from non-participant', async () => {
    const stranger = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: `demandeur-stranger-${suffix}@kolos.local`,
        password: 'Password123',
        firstName: 'Dan',
        lastName: 'Stranger',
        role: 'demandeur',
      })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/v1/requests/${publishedRequestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/reports`)
      .set('Authorization', `Bearer ${stranger.body.accessToken}`)
      .send({ motif: 'OTHER', description: 'Intrus' })
      .expect(403);
  });

  it('rejects report with invalid motif', async () => {
    const detail = await request(app.getHttpServer())
      .get(`/v1/requests/${publishedRequestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/reports`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({ motif: 'INVALID', description: 'Motif invalide' })
      .expect(400);
  });

  it('lists empty messages then posts as demandeur (Mongo)', async () => {
    const detail = await request(app.getHttpServer())
      .get(`/v1/requests/${publishedRequestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    const empty = await request(app.getHttpServer())
      .get(`/v1/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    expect(empty.body).toEqual([]);

    const created = await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({ body: 'Bonjour, merci pour votre aide sur les courses.' })
      .expect(201);

    expect(created.body.missionId).toBe(missionId);
    expect(created.body.body).toContain('courses');
    expect(created.body.conversationId).toBeTruthy();

    const listed = await request(app.getHttpServer())
      .get(`/v1/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    expect(listed.body.length).toBeGreaterThanOrEqual(1);
    expect(listed.body.some((m: { body: string }) => m.body.includes('courses'))).toBe(
      true,
    );
  });

  it('posts a message as aidant participant (Mongo)', async () => {
    const detail = await request(app.getHttpServer())
      .get(`/v1/applications/me/${applicationId}`)
      .set('Authorization', `Bearer ${aidantToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    const response = await request(app.getHttpServer())
      .post(`/v1/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${aidantToken}`)
      .send({ body: 'Je confirme mon arrivée vers 14h.' })
      .expect(201);

    expect(response.body.missionId).toBe(missionId);
    expect(response.body.body).toContain('14h');
  });

  it('forbids messaging for non-participant', async () => {
    const stranger = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: `aidant-stranger-${suffix}@kolos.local`,
        password: 'Password123',
        firstName: 'Eve',
        lastName: 'Stranger',
        role: 'aidant',
      })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/v1/requests/${publishedRequestId}`)
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(200);

    const missionId = detail.body.mission.id as number;

    await request(app.getHttpServer())
      .get(`/v1/missions/${missionId}/messages`)
      .set('Authorization', `Bearer ${stranger.body.accessToken}`)
      .expect(403);
  });
});
