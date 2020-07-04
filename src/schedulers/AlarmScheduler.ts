import * as admin from 'firebase-admin';
import { TokenMessage } from 'firebase-admin/lib/messaging';
import moment from 'moment-timezone';
import schedule from 'node-schedule';
import env from '../configs/index';
import { InternalServerError } from '../exceptions/Exception';
import { RedisUtil } from '../utils/RedisUtil';

moment.tz.setDefault('Asia/Seoul');

const redis = new RedisUtil(env.REDIS);

admin.initializeApp({
  credential: admin.credential.cert(env.FCM),
  databaseURL: 'https://habitbread-5abef.firebaseio.com',
});

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
          const data = await redis.hmget(`habitId:${habitId}`, ['userId', 'title', 'dayOfWeek']);
          const user = await redis.hmget(`userId:${data[0]}`, ['isAlarmOn', 'FCMToken']);
          if (user[0] === '0') break;
          const AMPM = moment().hours() >= 12 ? 'PM' : 'AM';
          const time = (type: string) => moment().format(type);
          const FCM: TokenMessage = {
            notification: {
              title: `습관빵 알람 - ${AMPM} ${time('hh')}:${time('mm')}`,
              body: `${data[1]}빵을 구울 시간이에요!`,
            },
            data: {
              habitId: habitId,
            },
            token: user[1],
          };

          await admin.messaging().send(FCM);

          let check = moment().day() + 1;
          if (check === 7) check = 0;
          while (data[2][check] !== '1') {
            check++;
            if (check === 7) check = 0;
          }

          if (check <= moment().day()) {
            check = 7 - moment().day() - check;
            await redis.sadd(moment().add(check, 'days').format('MMDDHHmm'), habitId);
            await redis.hmset(`habitId:${habitId}`, ['userId', data[0], 'title', data[1], 'dayOfWeek', data[2]]);
            await redis.expire(`habitId:${habitId}`, 604860);
          } else {
            check = check - moment().day();
            await redis.sadd(moment().add(check, 'days').format('MMDDHHmm'), habitId);
            await redis.hmset(`habitId:${habitId}`, ['userId', data[0], 'title', data[1], 'dayOfWeek', data[2]]);
            await redis.expire(`habitId:${habitId}`, 604860);
          }
        }
      } catch (err) {
        throw new InternalServerError(err.message);
      }
    });
  },
};

export default scheduler;
