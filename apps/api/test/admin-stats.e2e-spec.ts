import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin stats (e2e)', () => {
  let app: INestApplication;
  const suffix = Date.now();
  const demandeurEmail = `demandeur-stats-${suffix}@kolos.local`;
  let demandeurToken = '';
  let adminToken = '';

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

  it('forbids non-admin and returns stats for admin', async () => {
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

    await request(app.getHttpServer())
      .get('/v1/admin/stats')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(403);

    const adminLogin = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    const response = await request(app.getHttpServer())
      .get('/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        usersTotal: expect.any(Number),
        requestsTotal: expect.any(Number),
        requestsByStatus: expect.any(Object),
        missionsTotal: expect.any(Number),
        reportsOpen: expect.any(Number),
        reportsTotal: expect.any(Number),
        messagesTotal: expect.any(Number),
      }),
    );
    expect(response.body.usersTotal).toBeGreaterThanOrEqual(1);
  });
});
