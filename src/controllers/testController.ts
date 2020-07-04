import moment from 'moment-timezone';
import redis from 'redis';

moment.tz.setDefault('Asia/Seoul');

const redisClient = new redis.RedisClient({
  host: '49.50.163.233',
  port: 6379,
  password: 'zlekfl123!!',
});

const hmset = (key: string, value: string[]) => {
  return new Promise((resolve, response) => {
    redisClient.hmset(key, value, (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });
};

hmset('testId', ['key1', 'value1', 'key2', 'value2']);
