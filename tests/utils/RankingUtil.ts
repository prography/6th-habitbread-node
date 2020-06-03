import { PrismaClient, Ranking } from '@prisma/client';

// Key 값 검사
export const assertRanking = (item: Ranking) => {
  expect(item).toMatchObject({
    rankingId: item.rankingId,
    userId: item.userId,
    userName: item.userName,
    exp: item.exp,
    achievement: item.achievement,
  });
};

// Ranking 생성 모듈
export const createRanking = async (prisma: PrismaClient, ranking: Ranking) => {
  const newRanking = await prisma.ranking.create({
    data: {
      rankingId: ranking.rankingId,
      userId: ranking.userId,
      userName: ranking.userName,
      exp: ranking.exp,
      achievement: ranking.achievement,
    },
  });
  return newRanking;
};
