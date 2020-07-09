import { PrismaClient, User } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { redisUpsert } from '../../src/jobs/RankScheduler';
import { AuthHelper } from '../../src/middleware/AuthHelper';
import RedisUtil from '../../src/utils/RedisUtil';
import { AddUser } from '../../src/validations/UserValidation';
import { Payload } from '../payloads/Payload';
import { assertRanking } from '../utils/RankingUtil';
import { createUser } from '../utils/UserUtil';
dotenv.config({ path: `${__dirname}/../../.env.test` });

let user: User;
let token: string;

describe('Test Ranking', () => {
  const client = supertest(app);
  const prisma = new PrismaClient();
  const redis = RedisUtil.getInstance();

  beforeEach(async done => {
    await prisma.ranking.deleteMany({});
    await prisma.habit.deleteMany({});
    await prisma.userItem.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushall();

    // 사용자 생성 및 토큰 발급
    const payload = {
      name: '이우원',
      oauthKey: process.env.TEST_USER_OAUTH_KEY!,
      exp: 5000,
    };
    user = await createUser(prisma, new AddUser(payload));
    token = AuthHelper.makeAccessToken(user.userId);
    await redisUpsert(user, 100);

    // 랭킹 리스트
    let i = 0;
    for (const payload of Payload.RankingPayloads(user.userId)) {
      i += 10;
      await redisUpsert(payload, i);
    }
    done();
  });

  // 특정 사용자의 캐릭터 조회 테스트
  test('Get - /ranking', async () => {
    const res = await client.get('/ranking').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    assertRanking(res.body);

    // 현재 사용자가 맞는지
    expect(res.body.user).toMatchObject({
      userId: user.userId,
      userName: user.name,
      exp: user.exp,
      achievement: expect.any(Number),
      rank: expect.any(String),
    });
    expect(res.body.rankings).toHaveLength(6);
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
