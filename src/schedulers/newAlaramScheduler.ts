import * as admin from 'firebase-admin';
import moment from 'moment-timezone';
import schedule from 'node-schedule';
import env from '../configs/index';
import { InternalServerError } from '../exceptions/Exception';
import { RedisUtil } from '../utils/RedisUtil';

moment.tz.setDefault('Asia/Seoul');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const redis = new RedisUtil({
  host: '49.50.163.233',
  port: 6379,
  password: 'zlekfl123!!',
});

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
        }
      } catch (err) {
        throw new InternalServerError(err.message);
      }
    });
  },
};

export default scheduler;
