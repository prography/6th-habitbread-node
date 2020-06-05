import { Habit, PrismaClient, User } from '@prisma/client';
import * as admin from 'firebase-admin';
import moment from 'moment-timezone';
import schedule from 'node-schedule';
import { InternalServerError, NotFoundError } from '../exceptions/Exception';
moment.tz.setDefault('Asia/Seoul');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../configs/serviceAccount.json');
const prisma = new PrismaClient();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://habitbread-5abef.firebaseio.com',
});

type AlarmQueue = {
  fcmtoken: string;
  title: string;
  alarmTime: number;
  habitId: number;
};

type HabitIncludeUser = {
  user: User;
  habitId: number;
  alarmTime: string | null;
  title: string;
  dayOfWeek: string;
};

const habitCheck = (habit: HabitIncludeUser | null) => {
  if (habit === null) return true;
  if (habit.alarmTime === null || habit.user.fcmToken === null) return true;
  return false;
};
let alarmQueue: AlarmQueue[] = [];
const UpsertAlarmQueue = async () => {
  console.log('습관빵 알림 리스트 시작~!');
  try {
    const data = await prisma.scheduler.findMany();

    for await (const schedule of data) {
      console.log(schedule);
      const habit = await prisma.habit.findOne({
        where: { habitId: schedule.habitId },
        select: { user: true, habitId: true, alarmTime: true, title: true, dayOfWeek: true },
      });
      if (habitCheck(habit)) continue;
      if (habit!.dayOfWeek[moment().add(1, 'days').day()] === '1') {
        alarmQueue.push({
          fcmtoken: habit!.user.fcmToken!,
          title: habit!.title,
          habitId: habit!.habitId,
          alarmTime: parseInt(moment(habit!.alarmTime, 'HH:mm:ss').format('HHmm')),
        });
      }
    }
    alarmQueue.sort((a, b) => a.alarmTime - b.alarmTime);
  } catch (err) {
    throw new InternalServerError(err.message);
  }
  console.log('정렬 끝 =)');
};
const scheduler = {
  UpsertAlarmQueue,
  DeleteDataFromQueue: (data: Habit) => {
    alarmQueue = alarmQueue.filter(alarm => alarm.habitId !== data.habitId);
  },
  AddDataInToQueue: async (user: User, data: Habit) => {
    try {
      if (user.fcmToken === null) throw new NotFoundError('알람 설정 사용자가 아닙니다.');
      alarmQueue.push({
        fcmtoken: user.fcmToken,
        title: data.title,
        habitId: data.habitId,
        alarmTime: parseInt(moment(data.alarmTime, 'HH:mm:ss').format('HHmm')),
      });
      alarmQueue.sort((a, b) => a.alarmTime - b.alarmTime);
      console.log('alarmQueue 업데이트 완료');
    } catch (err) {
      throw new InternalServerError(err.message);
    }
  },
  // 00시 00분에 습관 등록
  AlarmUpdateJob: async () => {
    console.log('AlarmUpdate 스케줄러 정상 작동');
    schedule.scheduleJob({ hour: 23, minute: 59, second: 1 }, async () => {
      await UpsertAlarmQueue();
    });
  },
  //알람 메세지 전송
  SendAlarmJob: async () => {
    console.log('SendAlarm 스케줄러 정상 작동');
    schedule.scheduleJob('*/1 * * * *', async () => {
      console.log('FCM 전송 스케줄러 작동');
      try {
        // eslint-disable-next-line no-constant-condition
        while (1) {
          if (alarmQueue.length === 0) break;
          if (alarmQueue[0].alarmTime > parseInt(moment().format('HHmm'))) break;
          if (alarmQueue[0].alarmTime < parseInt(moment().format('HHmm'))) {
            alarmQueue.shift();
            continue;
          }
          const alarm = alarmQueue.shift();
          if (!alarm) continue;

          let timeString: string = alarm?.alarmTime.toString();
          if (timeString.length === 2) timeString += '00';
          if (timeString.length === 3) timeString += '0';
          const time = (type: string) => moment(timeString, 'HHmm').format(type);
          const AMPM = moment(alarm?.alarmTime.toString(), 'HHmm').hours() >= 12 ? 'PM' : 'AM';
          const fcmMessage = {
            notification: {
              title: `습관빵 알람 - ${AMPM} ${time('hh')}:${time('mm')}`,
              body: `${alarm.title}빵을 구울 시간이에요!`,
            },
            data: {
              habitId: alarm.habitId.toString(),
            },
            token: alarm.fcmtoken,
          };
          await admin.messaging().send(fcmMessage);
        }
      } catch (err) {
        throw new InternalServerError(err.message);
      }
    });
  },
};

export default scheduler;
