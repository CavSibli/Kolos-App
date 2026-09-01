import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const uniqueEmail = `user-${Date.now()}@kolos.local`;
  let accessToken = '';
  let refreshCookie = '';

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

  it('registers a demandeur', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Password123',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'demandeur',
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.email).toBe(uniqueEmail);
    expect(response.headers['set-cookie']).toBeDefined();

    accessToken = response.body.accessToken;
    refreshCookie = response.headers['set-cookie'][0].split(';')[0];
  });

  it('returns current user with bearer token', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe(uniqueEmail);
    expect(response.body.roles).toContain('demandeur');
  });

  it('refreshes session using httpOnly cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    accessToken = response.body.accessToken;
    refreshCookie = response.headers['set-cookie'][0].split(';')[0];
  });

  it('rejects invalid login', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'WrongPassword123',
      })
      .expect(401);
  });

  it('logs out and blocks /me', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', refreshCookie)
      .expect(204);

    await request(app.getHttpServer())
      .get('/v1/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
