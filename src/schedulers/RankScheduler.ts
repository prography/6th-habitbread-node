import { PrismaClient, User } from '@prisma/client';
import schedule from 'node-schedule';
import { AchievementUtil } from '../utils/AchievementUtil';

const prisma = new PrismaClient();

// 랭킹 upsert 메서드
const upsertRanking = async (user: User) => {
  const habits = await prisma.habit.findMany({
    where: { userId: user.userId },
    include: { commitHistory: true },
  });

  let achievement = 0;
  habits.forEach(habit => {
    const newHabit: any = AchievementUtil.calulateAchievement(habit);
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
  // 1시간 마다 모든 사용자의 경험치를 조회한 후 Ranking 테이블 갱신
  RankingUpdateJob: () => {
    console.log('랭킹 업데이트 스케줄러 설정 완료 :)');

    schedule.scheduleJob('*/1 * * * *', async () => {
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
