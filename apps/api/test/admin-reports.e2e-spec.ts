import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin reports (e2e)', () => {
  let app: INestApplication;
  const suffix = Date.now();
  const demandeurEmail = `demandeur-admin-${suffix}@kolos.local`;
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

  it('registers a demandeur (non-admin)', async () => {
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
  });

  it('logs in seeded admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      })
      .expect(200);

    adminToken = response.body.accessToken;
    expect(response.body.user.roles).toEqual(
      expect.arrayContaining(['admin']),
    );
  });

  it('forbids non-admin from listing reports', async () => {
    await request(app.getHttpServer())
      .get('/v1/admin/reports')
      .set('Authorization', `Bearer ${demandeurToken}`)
      .expect(403);
  });

  it('rejects unauthenticated list', async () => {
    await request(app.getHttpServer()).get('/v1/admin/reports').expect(401);
  });

  it('lists reports for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/admin/reports')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        pageSize: 20,
      }),
    );
  });
});
