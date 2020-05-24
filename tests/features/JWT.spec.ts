import { PrismaClient, User } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { AddUser } from '../../src/validations/UserValidation';
import { createUser } from '../utils/UserUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });

describe('testHabit', () => {
  const testClient = supertest(app);
  const prisma = new PrismaClient();

  let user: User;

  beforeEach(async done => {
    await prisma.character.deleteMany({});
    await prisma.habit.deleteMany({});
    await prisma.user.deleteMany({});
    user = await createUser(prisma, new AddUser('김건훈', 'dnatuna123@gmail.com'));
    done();
  });

  // GET createToken
  test('createToken', async () => {
    const res = await testClient.get(`/users/${user.userId}/token/create`);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['AccessToken']));
  });

  // GET checkToken
  test('checkToken', async () => {
    const token = await testClient.get(`/users/${user.userId}/token/create`);
    const res = await testClient
      .get(`/users/${user.userId}/token/check`)
      .set('Authorization', `Bearer ${token.body.AccessToken}`);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['userId']));
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
