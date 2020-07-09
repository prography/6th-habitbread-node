import { User } from '@prisma/client';
import _ from 'lodash';
import { CurrentUser, Get, JsonController } from 'routing-controllers';
import { InternalServerError } from '../exceptions/Exception';
import { errorService } from '../services/LogService';
import RedisUtil from '../utils/RedisUtil';
import { BaseController } from './BaseController';

@JsonController('/ranking')
export class RankingController extends BaseController {
  private redis: RedisUtil;

  constructor() {
    super();
    this.redis = RedisUtil.getInstance();
  }

  // 나의 랭킹 + 전체 랭킹 리스트 조회
  @Get()
  public async index(@CurrentUser() currentUser: User) {
    try {
      let users = await this.redis.zrevrange('user:score', 0, -1, 'withscores');
      users = _.fromPairs(_.chunk(users, 2)); // Array to Object pair 2 elements

      const rankings = [];
      const userKeys = Object.keys(users);
      for (const key of userKeys) {
        const user = await this.rankBuilder(users, key);
        rankings.push(user);
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
  public async rankBuilder(users: Record<string, string>, key: string) {
    const userHash = await this.redis.hgetall(key);

    const score = users[key];
    const denseRank = await this.redis.zrevrangebyscore('user:score', score, score, 'limit', 0, 1);

    const userId = Number(key.split(':')[1]);
    const userName = userHash.name;
    const exp = Number(userHash.exp);
    const achievement = Number(userHash.achievement);
    const rank = String((await this.redis.zrevrank('user:score', denseRank[0])) + 1);

    return { userId, userName, exp, achievement, rank };
  }
}
