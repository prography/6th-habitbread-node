import { PrismaClient, Ranking } from '@prisma/client';
import { JsonResponse } from '../../src/@types/types-custom';

// Key 값 검사
export const assertRanking = (item: JsonResponse) => {
  expect(item).toMatchObject({
    user: item.user,
    userTotalCount: item.userTotalCount,
    rankings: item.rankings,
  });
};

// Ranking 생성 모듈
export const createRanking = async (prisma: PrismaClient, ranking: Ranking) => {
  const newRanking = await prisma.ranking.create({
    data: {
      userId: ranking.userId,
      userName: ranking.userName,
      exp: ranking.exp,
      achievement: ranking.achievement,
    },
  });
  return newRanking;
};
