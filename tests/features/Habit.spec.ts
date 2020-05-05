import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { AddUser } from '../../src/validations/UserValidation';
import { Payload } from '../utils/HabtiPayloads';
import { createUser } from '../utils/UserUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });

describe('testHabit', () => {
  const testClient = supertest(app);
  const prisma = new PrismaClient();

  let habitId: number, userId: number;

  beforeEach(async done => {
    await prisma.character.deleteMany({});
    await prisma.habit.deleteMany({});
    await prisma.user.deleteMany({});
    const user = await createUser(prisma, new AddUser('김건훈', 'dnatuna123@gmail.com'));
    userId = user.userId;
    for (let i = 0; i < 3; i += 1) {
      const payload = Payload.originalPayloads[i];

      const res = await testClient.post(`/users/${userId}/habits`).send(payload);
      if (i === 0) {
        habitId = res.body.habitId;
      }
    }
    done();
  });

  // POST creatHabits
  test('createHabits', async () => {
    for (let i = 0; i < 3; i += 1) {
      const payload = Payload.originalPayloads[i];

      const res = await testClient.post(`/users/${userId}/habits`).send(payload);
      if (i === 0) {
        habitId = res.body.habitId;
      }
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        category: payload.category,
        description: payload.description,
        habitId: habitId + i,
        title: payload.title,
        userId: userId,
      });
    }
  });

  // GET getHabits
  test('getHabits', async () => {
    const res = await testClient.get(`/users/${userId}/habits`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(Payload.checkOriginalPayloads(userId, habitId));
  });

  // GET getHabit
  test('getHabit', async () => {
    for (let i = 0; i < 3; i += 1) {
      const payload = Payload.originalPayloads[i];

      const res = await testClient.get(`/users/${userId}/habits/${habitId + i}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        category: payload.category,
        description: payload.description,
        habitId: habitId + i,
        title: payload.title,
        userId: userId,
      });
    }
  });

  // PUT updateHabit
  test('updateHabit', async () => {
    for (let i = 0; i < 3; i += 1) {
      const payload = Payload.originalPayloads[i];

      const res = await testClient.put(`/users/${userId}/habits/${habitId + i}`).send(payload);
      if (i === 0) {
        habitId = res.body.habitId;
      }
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        category: payload.category,
        description: payload.description,
        habitId: habitId + i,
        title: payload.title,
        userId: userId,
      });
    }
  });

  // DELETE deleteHabit
  test('deleteHabit', async () => {
    const res = await testClient.delete(`/users/${userId}/habits/${habitId}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: 'success',
    });
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
