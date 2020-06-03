import { PrismaClient, User } from '@prisma/client';
import schedule from 'node-schedule';
import { Util } from '../utils/util';

const prisma = new PrismaClient();

const upsertRanking = async (user: User) => {
  const habits = await prisma.habit.findMany({
    where: { userId: user.userId },
    include: { commitHistory: true },
  });

  let achievement = 0;
  habits.forEach(habit => {
    const newHabit: any = Util.calulateAchievement(habit);
    achievement += newHabit.percent;
  });
  if (habits.length > 0) achievement = Math.round(achievement / habits.length);

  await prisma.ranking.upsert({
    where: { userId: user.userId },
    create: {
      userId: user.userId,
      userName: user.name!,
      exp: user.exp,
      achievement,
    },
    update: {
      userName: user.name!,
      exp: user.exp,
      achievement,
    },
  });
};

const scheduler = {
  // 1시간 마다 모든 사용자의 캐릭터 경험치를 조회한 후 Rank 테이블 갱신
  RankingUpdateJob: () => {
    console.log('랭킹 업데이트 스케줄러 설정 완료 :)');

    schedule.scheduleJob('*/10 * * * * *', async () => {
      console.log('랭킹 업데이트 시작 !');
      try {
        const users = await prisma.user.findMany();

        for (const user of users) await upsertRanking(user);
      } catch (err) {
        throw new Error(err.message);
      }

      console.log('랭킹 업데이트 종료 :)');
    });
  },
};

export default scheduler;
