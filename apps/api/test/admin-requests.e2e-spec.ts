import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin requests (e2e)', () => {
  let app: INestApplication;
  const suffix = Date.now();
  const demandeurEmail = `req-owner-${suffix}@kolos.local`;
  let demandeurToken = '';
  let demandeurId = '';
  let adminToken = '';
  let requestId = 0;

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

  it('lists and soft-cancels a request as admin', async () => {
    const registered = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: demandeurEmail,
        password: 'Password123',
        firstName: 'Owner',
        lastName: 'Request',
        role: 'demandeur',
      })
      .expect(201);
    demandeurToken = registered.body.accessToken;
    demandeurId = registered.body.user.id;

    const published = await request(app.getHttpServer())
      .post('/v1/requests')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .send({
        titre: 'Courses admin cancel',
        description: 'Pour test cancel soft',
        adresse: 'Lyon',
        dateMission: '2031-01-15T10:00:00.000Z',
        dureeEstimee: 60,
        nbAidantsRequis: 1,
      })
      .expect(201);
    requestId = published.body.id;

    await request(app.getHttpServer())
      .get('/v1/admin/requests')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(403);

    const adminLogin = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    const list = await request(app.getHttpServer())
      .get('/v1/admin/requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(list.body.items.some((item: { id: number }) => item.id === requestId)).toBe(
      true,
    );

    const cancelled = await request(app.getHttpServer())
      .post(`/v1/admin/requests/${requestId}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    expect(cancelled.body.status).toBe('CANCELLED');
    expect(demandeurId).toBeTruthy();
  });
});
