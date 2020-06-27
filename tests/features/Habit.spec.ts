import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import moment from 'moment-timezone';
import supertest from 'supertest';
import app from '../../src/app';
import { AuthHelper } from '../../src/middleware/AuthHelper';
import { AddUser } from '../../src/validations/UserValidation';
import { Payload } from '../payloads/Payload';
import { createUserWithFCM } from '../utils/UserUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });
moment.tz.setDefault('Aisa/Seoul');

describe('testHabit', () => {
  const testClient = supertest(app);
  const prisma = new PrismaClient();

  let habitId: number, token: string;

  beforeEach(async done => {
    await prisma.commitHistory.deleteMany({});
    await prisma.habit.deleteMany({});
    await prisma.userItem.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.user.deleteMany({});
    const user = await createUserWithFCM(prisma, new AddUser({ name: '김건훈', oauthKey: 'dnatuna123@gmail.com' }));
    token = AuthHelper.makeAccessToken(user.userId);
    for (let i = 0; i < 3; i += 1) {
      const payload = Payload.habitOriginalPayloads[i];

      const res = await testClient.post('/habits').set('Authorization', `Bearer ${token}`).send(payload);
      if (i === 0) {
        habitId = res.body.habitId;
      }
    }
    done();
  });

  // POST creatHabits
  test('createHabits', async () => {
    for (let i = 0; i < 3; i += 1) {
      const payload = Payload.habitOriginalPayloads[i];
      const res = await testClient.post('/habits').set('Authorization', `Bearer ${token}`).send(payload);
      if (i === 0) {
        habitId = res.body.habitId;
      }
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        habitId: habitId + i,
        userId: AuthHelper.extractUserFromToken(token),
        title: payload.title,
        category: payload.category,
        description: payload.description,
        dayOfWeek: payload.dayOfWeek,
        alarmTime: payload.alarmTime,
        continuousCount: 0,
      });
    }
  });

  // GET getHabits
  test('getHabits', async () => {
    const res = await testClient.get('/habits').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      comment: res.body.comment,
      habits: Payload.habitGetPayloads(habitId),
    });
  });

  // GET getHabit
  test('getHabit', async () => {
    for (let i = 0; i < 3; i += 1) {
      const payload = Payload.habitOriginalPayloads[i];
      const res = await testClient
        .get(`/habits/${habitId + i}/calendar/${parseInt(moment().format('YYYY'))}/${parseInt(moment().format('M'))}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        habit: {
          habitId: habitId + i,
          userId: AuthHelper.extractUserFromToken(token),
          title: payload.title,
          category: payload.category,
          description: payload.description,
          dayOfWeek: payload.dayOfWeek,
          alarmTime: payload.alarmTime,
          continuousCount: 0,
          commitHistory: [],
        },
        commitFullCount: 0,
      });
    }
  });

  // PUT updateHabit
  test('updateHabit', async () => {
    for (let i = 0; i < 3; i += 1) {
      const payload = Payload.habitUpdatePayloads[i];

      const res = await testClient
        .put(`/habits/${habitId + i}`)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      if (i === 0) {
        habitId = res.body.habitId;
      }
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        habitId: habitId + i,
        userId: AuthHelper.extractUserFromToken(token),
        title: payload.title,
        category: payload.category,
        description: payload.description,
        dayOfWeek: payload.dayOfWeek,
        alarmTime: payload.alarmTime,
        continuousCount: 0,
      });
    }
  });

  // DELETE deleteHabit
  test('deleteHabit', async () => {
    const res = await testClient.delete(`/habits/${habitId}`).set('Authorization', `Bearer ${token}`);
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
