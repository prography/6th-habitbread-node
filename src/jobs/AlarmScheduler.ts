import * as admin from 'firebase-admin';
import { TokenMessage } from 'firebase-admin/lib/messaging';
import moment from 'moment-timezone';
import schedule from 'node-schedule';
import env from '../configs/index';
import { InternalServerError } from '../exceptions/Exception';
import RedisUtil from '../utils/RedisUtil';

moment.tz.setDefault('Asia/Seoul');

const redis = RedisUtil.getInstance();

admin.initializeApp({
  credential: admin.credential.cert(env.FCM),
  databaseURL: 'https://habitbread-5abef.firebaseio.com',
});

const checkIndexOfNextDay = (todayIndex: number, dayOfWeek: string) => {
  let indexOfNextDay = todayIndex + 1;
  if (indexOfNextDay === 7) indexOfNextDay = 0;
  while (dayOfWeek[indexOfNextDay] !== '1') {
    indexOfNextDay++;
    if (indexOfNextDay === 7) indexOfNextDay = 0;
  }

  return indexOfNextDay;
};

const scheduler = {
  //알람 메세지 전송
  SendAlarmJob: async () => {
    console.log('SendAlarm 스케줄러 정상 작동');
    schedule.scheduleJob('*/1 * * * *', async () => {
      console.log('FCM 전송 스케줄러 작동');
      try {
        // eslint-disable-next-line no-constant-condition
        while (1) {
          const habitId = await redis.spop(moment().format('MMDDHHmm'));
          if (habitId === null) break;
          const [userId, title, dayOfWeek] = await redis.hmget(`habitId:${habitId}`, ['userId', 'title', 'dayOfWeek']);
          const [isAlarmOn, FCMToekn] = await redis.hmget(`userId:${userId}`, ['isAlarmOn', 'FCMToken']);
          if (isAlarmOn === '0') break;
          const AMPM = moment().hours() >= 12 ? 'PM' : 'AM';
          const time = (type: string) => moment().format(type);
          const FCM: TokenMessage = {
            notification: {
              title: `습관빵 알람 - ${AMPM} ${time('hh')}:${time('mm')}`,
              body: `${title}빵을 구울 시간이에요!`,
            },
            data: {
              habitId: habitId,
            },
            token: FCMToekn,
          };

          await admin.messaging().send(FCM);

          const indexOfNextDay = checkIndexOfNextDay(moment().day(), dayOfWeek);
          let dateToAdd;
          if (indexOfNextDay <= moment().day()) dateToAdd = 7 - moment().day() + indexOfNextDay;
          else dateToAdd = indexOfNextDay - moment().day();
          await redis.sadd(moment().add(dateToAdd, 'days').format('MMDDHHmm'), habitId);
          await redis.hmset(`habitId:${habitId}`, ['userId', userId, 'title', title, 'dayOfWeek', dayOfWeek]);
          await redis.expire(`habitId:${habitId}`, 604860);
        }
      } catch (err) {
        throw new InternalServerError(err.message);
      }
    });
  },
};

export default scheduler;
