import { PrismaClient, Ranking, User } from '@prisma/client';
import { CurrentUser, Get, JsonController } from 'routing-controllers';
import { InternalServerError } from '../exceptions/Exception';
import { errorService } from '../services/LogService';
import { BaseController } from './BaseController';

@JsonController('/ranking')
export class RankingController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 나의 랭킹 + 전체 랭킹 리스트 조회
  @Get()
  public async index(@CurrentUser() currentUser: User) {
    try {
      const rankings: Ranking[] = await this.prisma.raw`
        SELECT
          *
        FROM (
          SELECT
            r1.user_id AS userId,
            r1.user_name AS userName,
            r1.exp,
            r1.achievement,
            @rownum := @rownum + 1 AS rank
          FROM ranking r1
          JOIN (SELECT @rownum := 0) row
          ORDER BY r1.exp desc, r1.achievement desc
        ) r2
      `;
      const user = rankings.filter(ranking => ranking.userId === currentUser.userId)[0];
      const userTotalCount = await this.prisma.ranking.count();

      return { user, userTotalCount, rankings: rankings.slice(0, 200) };
    } catch (err) {
      errorService(err);
      throw new InternalServerError(err.message);
    }
  }
}
