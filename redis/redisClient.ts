import redis from 'redis';
import { promisify } from 'util';

// 방식 1
export default class RedisClient {
  private static util: null | RedisClient = null;
  private client = redis.createClient(process.env.REDIS_URL!);

  // 메서드를 Promise화로 만들어 반환하는 함수
  private promisify(method: Function) {
    return promisify(method).bind(this.client);
  }

  // 싱글톤
  public static getInstance() {
    if (!this.util) {
      this.util = new RedisClient();
    }
    return this.util;
  }

  // Redis 종료
  public close() {
    return this.client.quit();
  }

  // keys
  public readonly keys = this.promisify(this.client.keys);

  // string
  public readonly get = this.promisify(this.client.get);
  public readonly set = this.promisify(this.client.set);

  // hash
  public readonly hmset = this.promisify(this.client.hmset);
  public readonly hmget = this.promisify(this.client.hmget);
  public readonly hgetall = this.promisify(this.client.hgetall);

  // set
  public readonly smembers = this.promisify(this.client.smembers);
  public readonly sadd = this.promisify(this.client.sadd);
  public readonly spop = this.promisify(this.client.spop);
  public readonly srem = this.promisify(this.client.srem);

  // sorted set
  public readonly zadd = this.promisify(this.client.zadd);
  public readonly zrange = this.promisify(this.client.zrange);
  public readonly zrangebyscore = this.promisify(this.client.zrangebyscore);
  public readonly zrank = this.promisify(this.client.zrank);

  // expire
  public readonly expire = this.promisify(this.client.expire);
}
