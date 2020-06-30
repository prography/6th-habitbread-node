import moment from 'moment-timezone';
import schedule from 'node-schedule';
import redis from 'redis';

moment.tz.setDefault('Asia/Seoul');

const redisClient = new redis.RedisClient({
  host: '49.50.163.233',
  port: 6379,
  password: 'zlekfl123!!',
});

const time = moment().add(5, 'seconds').format('mmss');
redisClient.rpush(time, ['1', '2,', '3']);

const popHabitId = () => {
  return new Promise((resolve, response) => {
    redisClient.rpop(moment().format('mmss'), (err, data) => {
      if (data) {
        resolve(data);
      } else {
        resolve(null);
      }
    });
  });
};

schedule.scheduleJob('*/1 * * * * *', async () => {
  console.log('1초에 한 번씩 실행 됐다!');
  let check = 1;
  while (check) {
    const data = await popHabitId();
    if (data) console.log(data);
    else check = 0;
  }
});
