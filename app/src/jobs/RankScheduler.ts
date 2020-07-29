import { PrismaClient, User } from '@prisma/client';
import schedule from 'node-schedule';
import logger from '../configs/LogConfig';
import { AchievementUtil } from '../utils/AchievementUtil';
import RedisUtil from '../utils/RedisUtil';

const prisma = new PrismaClient();
const redis = RedisUtil.getInstance();
const expire = 31 * 60; // 31분

// Redis에 랭킹 데이터 저장
export const redisUpsert = async (user: User | Record<string, any>, achievement: number) => {
  const { userId, name, exp } = user;
  await redis.zadd('user:score', exp, `user:${userId}`);
  await redis.expire('user:score', expire);

  const userInfo = { name, exp, achievement };
  await redis.hmset(`user:${userId}`, userInfo);
};

// 랭킹 upsert 메서드
const upsertRanking = async (user: User) => {
  const habits = await prisma.habit.findMany({
    where: { userId: user.userId },
    include: { commitHistory: true },
  });

  let achievement = 0;
  if (habits.length > 0) {
    habits.forEach(habit => {
      const newHabit: any = AchievementUtil.calulateAchievement(habit);
      achievement += newHabit.percent;
    });

    achievement = Math.round(achievement / habits.length);
  }

  await redisUpsert(user, achievement);
};

export const rankingJob = async () => {
  console.log('랭킹 업데이트 시작 !');
  try {
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      logger.info('랭킹 업데이트: 업데이트 할 사용자가 없습니다.');
      return;
    }
    for (const user of users) await upsertRanking(user);
  } catch (err) {
    throw new Error(err.message);
  }
  console.log('랭킹 업데이트 종료 :)');
};

export const disconnect = async () => {
  await redis.quit();
  await prisma.disconnect();
};

const scheduler = {
  // 1시간 마다 모든 사용자의 경험치를 조회한 후 Ranking 테이블 갱신
  RankingUpdateJob: () => {
    console.log('랭킹 업데이트 스케줄러 설정 완료 :)');
    schedule.scheduleJob('*/5 * * * *', async () => rankingJob());
  },
};

export default scheduler;
