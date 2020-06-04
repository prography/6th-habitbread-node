import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';
import moment from 'moment-timezone';
import schedule from 'node-schedule';
import { HttpError } from 'routing-controllers';
import { InternalServerError, NotFoundError } from '../exceptions/Exception';

moment.tz.setDefault('Asia/Seoul');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../configs/serviceAccount.json');
const prisma = new PrismaClient();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const alarmQueue: { fcmtoken: string; title: string; alarmTime: Date; habitId: number }[] = [];

const scheduler = {
  // 00시 00분에 습관 등록
  AlarmUpdateJob: async () => {
    console.log('오늘의 습관빵 알림 정렬');

    schedule.scheduleJob({ hour: 2, minute: 3, second: 40 }, async () => {
      console.log('습관빵 알림 리스트 시작~!');
      try {
        const data = await prisma.scheduler.findMany();

        for await (const schedule of data) {
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
            habitId: habit.habitId,
            alarmTime: moment(habit.alarmTime, 'HH:mm:ss').toDate(),
          });
        }
        alarmQueue.sort((a, b) => {
          if (a.alarmTime > b.alarmTime) return 1;
          else return -1;
        });
        console.log(alarmQueue);
      } catch (err) {
        if (err instanceof HttpError) throw err;
        throw new InternalServerError(err.message);
      }
      console.log('습관빵 알림 리스트 끝!!!');
    });
  },
  FCMJob: async () => {
    while (alarmQueue.length) {
      const alarm = alarmQueue.shift();
      if (!alarm) break;

      schedule.scheduleJob(alarm.alarmTime, async () => {
        const time = (type: string) => moment(alarm.alarmTime).format(type);
        const AMPM = moment(alarm.alarmTime).hours() > 12 ? 'PM' : 'AM';
        const fcmMessage = {
          notification: {
            title: `습관빵 알람 - ${AMPM} ${time('HH')}:${time('mm')}`,
            body: `${alarmQueue[0].title} 빵을 구울 시간이에요!`,
          },
        };
      });
    }
  },
};

export default scheduler;
