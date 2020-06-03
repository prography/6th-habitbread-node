import { PrismaClient, Ranking } from '@prisma/client';

// Key 값 검사
export const assertRanking = (item: any) => {
  const user = item.user;
  expect(user).toMatchObject({
    userId: user.userId,
    userName: user.userName,
    exp: user.exp,
    achievement: user.achievement,
    rank: user.rank,
    totalCount: user.totalCount,
  });

  const ranking: Array<any> = item.ranking;
  ranking.forEach(user => {
    expect(user).toMatchObject({
      userId: user.userId,
      userName: user.userName,
      exp: user.exp,
      achievement: user.achievement,
      rank: user.rank,
    });
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
