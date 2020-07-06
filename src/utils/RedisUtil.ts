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
    return new Promise<string | null>((resolve, response) => {
      this.client.spop(key, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  srem = (key: string, value: string) => {
    return new Promise((resolve, response) => {
      this.client.srem(key, value, (err, data) => {
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
    return new Promise<string[]>((resolve, response) => {
      this.client.hmget(key, value, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  expire = (key: string, value: number) => {
    return new Promise<number>((resolve, response) => {
      this.client.expire(key, value, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    });
  };

  closeRedis = () => this.client.quit();
}
