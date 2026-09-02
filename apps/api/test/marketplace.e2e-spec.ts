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
});
