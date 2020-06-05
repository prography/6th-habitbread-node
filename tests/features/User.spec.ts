import { PrismaClient, User } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { NotFoundError } from '../../src/exceptions/Exception';
import { AuthHelper } from '../../src/middleware/AuthHelper';
import { AddUser } from '../../src/validations/UserValidation';
import { assertUser, createUser } from '../utils/UserUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });

let user: User;
let token: string;

describe('Test User', () => {
  const client = supertest(app);
  const prisma = new PrismaClient();

  beforeEach(async done => {
    await prisma.ranking.deleteMany({});
    await prisma.habit.deleteMany({});
    await prisma.userItem.deleteMany({});
    await prisma.user.deleteMany({});

    // 사용자 생성 및 토큰 발급
    const payload = {
      name: '이우원',
      oauthKey: process.env.TEST_USER_OAUTH_KEY!,
    };
    user = await createUser(prisma, new AddUser(payload));
    token = AuthHelper.makeAccessToken(user.userId);
    done();
  });

  test('Get - /users', async () => {
    const res = await client.get('/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    assertUser(res.body);
  });

  test('Patch - /users', async () => {
    const payload = {
      name: '김건훈',
      exp: 100,
      fcmToken: 'fcmToken!@#$',
    };
    const res = await client.patch('/users').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(200);
    assertUser(res.body);

    expect(user.name).not.toEqual(res.body.name);
    expect(user.exp).not.toEqual(res.body.exp);
    expect(user.fcmToken).not.toEqual(res.body.fcmToken);
  });

  test('Delete - /users', async () => {
    const res1 = await client.delete('/users').set('Authorization', `Bearer ${token}`);
    expect(res1.status).toBe(200);
    expect(res1.body).toEqual({ message: 'Delete User Success' });

    const res2 = await client.get('/users').set('Authorization', `Bearer ${token}`);
    expect(res2.status).toBe(404);
    expect(res2.body.name).toEqual(NotFoundError.name);
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
