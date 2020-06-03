import { PrismaClient } from '@prisma/client';
import moment from 'moment-timezone';
import schedule from 'node-schedule';
import { HttpError } from 'routing-controllers';
import { InternalServerError, NotFoundError } from '../exceptions/Exception';

moment.tz.setDefault('Asia/Seoul');

const prisma = new PrismaClient();

const scheduler = {
  // 00시 00분에 습관 등록
  AlarmUpdateJob: async () => {
    console.log('오늘의 습관빵 알림 정렬');

    const alarmQueue: { fcmtoken: string; title: string; alarmTime: Date }[] = [];
    schedule.scheduleJob({ hour: 22, minute: 51, second: 40 }, async () => {
      console.log('랭킹 업데이트 시작 !');
      try {
        const data = await prisma.scheduler.findMany();

        data.forEach(async (schedule: any) => {
          console.log(schedule);
          const user = await prisma.user.findOne({ where: { userId: schedule.userId } });
          const habit = await prisma.habit.findOne({ where: { habitId: schedule.habitId } });
          if (user === null) throw new NotFoundError('user 검색 실패');
          if (habit === null) throw new NotFoundError('habit 검색 실패');
          if (user.fcmToken === null) throw new NotFoundError('user 검색 실패');
          if (habit.alarmTime === null) throw new NotFoundError('habit 검색 실패');
          alarmQueue.push({
            fcmtoken: user.fcmToken,
            title: habit.title,
            alarmTime: moment(habit.alarmTime, 'HH:mm:ss').toDate(),
          });
        });
        console.log(alarmQueue);
      } catch (err) {
        if (err instanceof HttpError) throw err;
        throw new InternalServerError(err.message);
      }
      console.log('랭킹 업데이트 종료 :)');
    });
  },
};

export default scheduler;
