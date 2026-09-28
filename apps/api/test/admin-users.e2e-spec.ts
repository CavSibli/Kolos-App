import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin users ban (e2e)', () => {
  let app: INestApplication;
  const suffix = Date.now();
  const targetEmail = `ban-target-${suffix}@kolos.local`;
  let adminToken = '';
  let targetId = '';

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

  it('admin creates user, bans (login 403), then unbans', async () => {
    const adminLogin = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    const created = await request(app.getHttpServer())
      .post('/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: targetEmail,
        password: 'Password123',
        firstName: 'Ban',
        lastName: 'Target',
        role: 'demandeur',
      })
      .expect(201);

    targetId = created.body.id;
    expect(created.body.banned).toBe(false);

    await request(app.getHttpServer())
      .post(`/v1/admin/users/${targetId}/ban`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Test ban', until: null })
      .expect(201);

    await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: targetEmail, password: 'Password123' })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/v1/admin/users/${targetId}/unban`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: targetEmail, password: 'Password123' })
      .expect(200);
    expect(login.body.accessToken).toBeTruthy();
  });
});
