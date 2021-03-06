import { User } from '@prisma/client';
import _ from 'lodash';
import { InternalServerError } from '../exceptions/Exception';
import RedisRepository from '../repository/RedisRepository';
import { BaseService } from './BaseService';
import { errorService } from './LogService';

export class RankService extends BaseService {
  private redis: RedisRepository;

  constructor() {
    super();
    this.redis = new RedisRepository();
  }

  public async searchRankig(currentUser: User){
    try {
        let users = await this.redis.zrevrange('user:score', 0, -1, 'withscores');
        users = _.fromPairs(_.chunk(users, 2)); // Array to Object pair 2 elements
  
        const rankings = [];
        const userKeys = Object.keys(users);
        for (const key of userKeys) {
          const user = await this.rankBuilder(users, key);
          if (user) rankings.push(user);
        }
        const user = rankings.filter(ranking => ranking.userId === currentUser.userId)[0];
        const userTotalCount = userKeys.length;
  
        return { user, userTotalCount, rankings: rankings.slice(0, 200) };
      } catch (err) {
        errorService(err);
        throw new InternalServerError(err.message);
      }
  }

  // Ranking - Response 템플릿 빌더
  // Dense Ranking 기능
  private async rankBuilder(users: Record<string, string>, key: string) {
    const userHash = await this.redis.hgetall(key);
    if (userHash === null) return null;

    const score = users[key];
    const denseRank = await this.redis.zrevrangebyscore('user:score', score, score, 'limit', 0, 1);

    const userId = Number(key.split(':')[1]);
    const userName = userHash.name;
    const exp = Number(userHash.exp);
    const achievement = Number(userHash.achievement || 0);
    const rank = String((await this.redis.zrevrank('user:score', denseRank[0])) + 1);

    return { userId, userName, exp, achievement, rank };
  }
}
