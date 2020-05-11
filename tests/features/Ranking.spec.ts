import { PrismaClient, Ranking } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { AddRanking } from '../../src/validations/RankingValidation';
import { RankingPayload } from '../utils/RankingPayload';
import { assertRanking, createRanking } from '../utils/RankingUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });

describe('Test Character', () => {
  const client = supertest(app);
  const prisma = new PrismaClient();

  beforeEach(async done => {
    await prisma.ranking.deleteMany({});
    RankingPayload.payloads.forEach(async ranking => {
      await createRanking(prisma, new AddRanking(ranking));
    });
    done();
  });

  // 특정 사용자의 캐릭터 조회 테스트
  test('Get - /ranking', async () => {
    const res = await client.get('/ranking');
    expect(res.status).toBe(200);
    res.body.forEach((ranking: Ranking) => {
      assertRanking(ranking);
    });
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
