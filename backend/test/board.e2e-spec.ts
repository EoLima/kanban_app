import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Board (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Login to get session cookie
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'user', password: 'password' });

    const setCookie = loginRes.headers['set-cookie'];
    cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/board returns board with columns', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/board')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body.columns).toBeDefined();
    expect(res.body.columns.length).toBe(5);
    expect(typeof res.body.columns[0].title).toBe('string');
    expect(res.body.columns[0].title.length).toBeGreaterThan(0);
  });

  it('GET /api/board without auth returns 401', async () => {
    await request(app.getHttpServer()).get('/api/board').expect(401);
  });

  it('POST /api/cards creates a card', async () => {
    const columnId = await getFirstColumnId(app, cookie);

    const res = await request(app.getHttpServer())
      .post('/api/cards')
      .set('Cookie', cookie)
      .send({ columnId, title: 'Test Card', details: 'A test card' })
      .expect(201);

    expect(res.body.title).toBe('Test Card');
    expect(res.body.columnId).toBe(columnId);
  });

  it('PUT /api/cards/:id updates a card', async () => {
    const columnId = await getFirstColumnId(app, cookie);

    const createRes = await request(app.getHttpServer())
      .post('/api/cards')
      .set('Cookie', cookie)
      .send({ columnId, title: 'Original Title' });

    const res = await request(app.getHttpServer())
      .put(`/api/cards/${createRes.body.id}`)
      .set('Cookie', cookie)
      .send({ title: 'Updated Title', details: 'Updated details' })
      .expect(200);

    expect(res.body.title).toBe('Updated Title');
    expect(res.body.details).toBe('Updated details');
  });

  it('DELETE /api/cards/:id deletes a card', async () => {
    const columnId = await getFirstColumnId(app, cookie);

    const createRes = await request(app.getHttpServer())
      .post('/api/cards')
      .set('Cookie', cookie)
      .send({ columnId, title: 'Card to delete' });

    await request(app.getHttpServer())
      .delete(`/api/cards/${createRes.body.id}`)
      .set('Cookie', cookie)
      .expect(200);
  });

  it('PUT /api/columns/:id renames a column', async () => {
    const boardRes = await request(app.getHttpServer())
      .get('/api/board')
      .set('Cookie', cookie);

    const columnId = boardRes.body.columns[0].id;

    const res = await request(app.getHttpServer())
      .put(`/api/columns/${columnId}`)
      .set('Cookie', cookie)
      .send({ title: 'Renamed Column' })
      .expect(200);

    expect(res.body.title).toBe('Renamed Column');
  });

  it('PUT /api/board/move moves a card', async () => {
    const boardRes = await request(app.getHttpServer())
      .get('/api/board')
      .set('Cookie', cookie);

    const col1 = boardRes.body.columns[0];
    const col2 = boardRes.body.columns[1];

    // Create a card in col1
    const cardRes = await request(app.getHttpServer())
      .post('/api/cards')
      .set('Cookie', cookie)
      .send({ columnId: col1.id, title: 'Card to move' });

    const res = await request(app.getHttpServer())
      .put('/api/board/move')
      .set('Cookie', cookie)
      .send({
        cardId: cardRes.body.id,
        sourceColumnId: col1.id,
        targetColumnId: col2.id,
        sourceIndex: 0,
        targetIndex: 0,
      })
      .expect(200);

    // Verify card is now in col2
    const movedColumn = res.body.columns.find((c: any) => c.id === col2.id);
    const movedCard = movedColumn.cards.find(
      (c: any) => c.id === cardRes.body.id,
    );
    expect(movedCard).toBeDefined();
  });
});

async function getFirstColumnId(
  app: INestApplication<App>,
  cookie: string,
): Promise<string> {
  const boardRes = await request(app.getHttpServer())
    .get('/api/board')
    .set('Cookie', cookie);
  return boardRes.body.columns[0].id;
}
