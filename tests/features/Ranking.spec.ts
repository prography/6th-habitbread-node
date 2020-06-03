import { PrismaClient, Ranking, User } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { AuthHelper } from '../../src/middleware/AuthHelper';
import { AddRanking } from '../../src/validations/RankingValidation';
import { AddUser } from '../../src/validations/UserValidation';
import { Payload } from '../payloads/Payload';
import { createRanking } from '../utils/RankingUtil';
import { createUser } from '../utils/UserUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });

let user: User;
let token: string;

describe('Test Ranking', () => {
  const client = supertest(app);
  const prisma = new PrismaClient();

  beforeEach(async done => {
    await prisma.ranking.deleteMany({});
    await prisma.user.deleteMany({});

    // 사용자 생성 및 토큰 발급
    const payload = {
      name: '이우원',
      oauthKey: process.env.TEST_USER_OAUTH_KEY!,
    };
    user = await createUser(prisma, new AddUser(payload));
    token = AuthHelper.makeAccessToken(user.userId);

    // 랭킹 리스트
    for (const payload of Payload.RankingPayloads) await createRanking(prisma, new AddRanking(payload));

    // 로그인한 사용자 랭킹 등록
    const newRanking: Ranking = {
      userId: user.userId,
      userName: user.name!,
      exp: 5000,
      achievement: 100,
    };
    await createRanking(prisma, new AddRanking(newRanking));
    done();
  });

  // 특정 사용자의 캐릭터 조회 테스트
  test('Get - /ranking', async () => {
    const res = await client.get('/ranking').set('Authorization', `Bearer ${token}`);
    console.log(res.body);
    expect(res.status).toBe(200);
    // assertRanking(res.body);
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
