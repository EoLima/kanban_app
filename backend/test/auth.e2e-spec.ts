import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login with valid credentials returns 200', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'user', password: 'password' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/auth/login with invalid credentials returns 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'wrong', password: 'wrong' })
      .expect(401);

    expect(res.body.message).toBe('Invalid credentials');
  });

  it('GET /api/auth/session without cookie returns unauthenticated', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/session')
      .expect(200);

    expect(res.body.authenticated).toBe(false);
  });

  it('POST /api/auth/logout clears the cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
