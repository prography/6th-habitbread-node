import redis from 'redis';
import { promisify } from 'util';

export default class RedisClient {
  private static _instance: null | RedisClient = null;
  private client = redis.createClient(process.env.REDIS_URL!);

  // 메서드를 Promise화로 만들어 반환하는 함수
  private promisify(method: Function) {
    return promisify(method).bind(this.client);
  }

  private static onError(err: any): void {
    console.error('Redis Error : ' + err);
  }

  // 싱글톤
  public static getInstance() {
    if (!RedisClient._instance) {
      RedisClient._instance = new RedisClient();
      RedisClient._instance.client.on('error', this.onError);
    }
    return RedisClient._instance;
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
  public readonly zrevrange = this.promisify(this.client.zrevrange);
  public readonly zrevrangebyscore = this.promisify(this.client.zrevrangebyscore);
  public readonly zrevrank = this.promisify(this.client.zrevrank);

  // exists
  public readonly exists = this.promisify(this.client.exists);

  // expire
  public readonly expire = this.promisify(this.client.expire);

  // Redis 종료 - 서버 종료시 호출할 것
  public readonly quit = this.promisify(this.client.quit);
}
