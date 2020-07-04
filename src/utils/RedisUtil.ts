import { Habit, User } from '@prisma/client';
import moment from 'moment-timezone';
import redis, { RedisClient } from 'redis';
import { RedisConfig } from '../@types/types-custom';
import { Util } from './BaseUtil';
moment.tz.setDefault('Asia/Seoul');

export class RedisUtil extends Util {
  private client: RedisClient;

  constructor(config: RedisConfig) {
    super();
    this.client = new redis.RedisClient(config);
  }

  sadd = (key: string, value: string) => {
    return new Promise((resolve, response) => {
      this.client.sadd(key, value, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  spop = (key: string) => {
    return new Promise((resolve, response) => {
      this.client.spop(key, (err, data: string) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  hmset = (key: string, value: (string | number)[]) => {
    return new Promise((resolve, response) => {
      this.client.hmset(key, value, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  hmget = (key: string, value: string[]) => {
    return new Promise((resolve, response) => {
      this.client.hmget(key, value, (err, data) => {
        if (err) throw err;
        resolve({ userId: data[0], title: data[1], dayOfWeek: data[2] });
      });
    });
  };

  expire = (key: string, value: number) => {
    return new Promise((resolve, response) => {
      this.client.expire(key, value, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  setbit = (key: string, valueKey: number, valueValue: string) => {
    return new Promise((resolve, response) => {
      this.client.setbit(key, valueKey, valueValue, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  getbit = (key: string, value: number) => {
    return new Promise((resolve, response) => {
      this.client.getbit(key, value, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  addHabitIntoRedis = async (user: User, data: Habit) => {
    await new Promise((resolve, response) => {
      this.client.sadd(moment(data.alarmTime, 'HH:mm:ss').format('HHmm'), String(data.habitId), (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
    await new Promise((resolve, response) => {
      this.client.hmset(`habitId:${String(data.habitId)}`, 'userId', user.userId, 'title', data.title, 'dayOfWeek', data.dayOfWeek, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
    await new Promise((resolve, response) => {
      this.client.expire(`habitId:${String(data.habitId)}`, 86400, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
    await new Promise((resolve, response) => {
      this.client.hmset(`userId:${String(user.userId)}`, 'isAlarmOn', 1, 'FCMToken', user.fcmToken!, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
    await new Promise((resolve, response) => {
      this.client.expire(`userId:${String(user.userId)}`, 86400, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
    return new Promise((resolve, response) => {
      this.client.setbit('habitCheck', data.habitId, '1', (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  getAlarm = async () => {
    const habitId: string = await new Promise((resolve, response) => {
      this.client.spop(moment().format('MMDDHHmm'), (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
    if (habitId === null) return null;
    else {
      const habitCheck: number = await new Promise((resolve, response) => {
        this.client.getbit('habitCheck', parseInt(habitId), (err, data) => {
          if (err) throw err;
          resolve(data);
        });
      });
      if (habitCheck === 0) return null;
    }

    const { userId, title, dayOfWeek } = await new Promise((resolve, response) => {
      this.client.hmget(`habitId:${habitId}`, 'userId', 'title', 'dayOfWeek', (err, data) => {
        if (err) throw err;
        resolve({ userId: data[0], title: data[1], dayOfWeek: data[2] });
      });
    });
  };
  closeRedis = () => this.client.quit();
}
