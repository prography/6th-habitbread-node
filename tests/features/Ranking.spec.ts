import { PrismaClient, User } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { AuthHelper } from '../../src/middleware/AuthHelper';
import { AddRanking } from '../../src/validations/RankingValidation';
import { AddUser } from '../../src/validations/UserValidation';
import { Payload } from '../payloads/Payload';
import { assertRanking, createRanking } from '../utils/RankingUtil';
import { createUser } from '../utils/UserUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });

let user: User;
let token: string;
let rankings: Array<any>;

describe('Test Ranking', () => {
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

    // 로그인한 사용자 랭킹 등록
    const newRanking = {
      userId: user.userId,
      userName: user.name!,
      exp: 5000,
      achievement: 100,
    };
    const res = await createRanking(prisma, new AddRanking(newRanking));
    rankings = [];
    rankings.push(res);

    // 랭킹 리스트
    for (const payload of Payload.RankingPayloads) {
      const ranking = await createRanking(prisma, new AddRanking(payload));
      rankings.push(ranking);
    }

    done();
  });

  // 특정 사용자의 캐릭터 조회 테스트
  test('Get - /ranking', async () => {
    const res = await client.get('/ranking').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    assertRanking(res.body);

    // payload 순위 조정 (경험치 1순위, 달성도 2순위)
    rankings.sort((x, y) => {
      if (y.exp === x.exp) return y.achievement - x.achievement;
      return y.exp - x.exp;
    });

    const currrentUser = rankings.filter(ranking => ranking.userId === user.userId)[0];

    // 현재 사용자가 맞는지
    expect(res.body.user).toMatchObject({
      userId: currrentUser.userId,
      userName: currrentUser.userName,
      exp: currrentUser.exp,
      achievement: currrentUser.achievement,
      rank: expect.any(String),
    });

    // 전체 랭킹 순위가 맞는지
    // Use .toMatchObject to check that a JavaScript object matches a subset of the properties of an object.
    const length = res.body.rankings.length;
    for (let i = 0; i < length; i++) {
      expect(res.body.rankings[i]).toMatchObject({
        userId: rankings[i].userId,
        userName: rankings[i].userName,
        exp: rankings[i].exp,
        achievement: rankings[i].achievement,
        rank: expect.any(String),
      });
    }
    expect(res.body.rankings).toHaveLength(6);
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
