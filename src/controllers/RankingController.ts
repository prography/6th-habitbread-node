import { PrismaClient, Ranking, User } from '@prisma/client';
import { CurrentUser, Get, HttpError, JsonController } from 'routing-controllers';
import { InternalServerError } from '../exceptions/Exception';
import { BaseController } from './BaseController';

@JsonController('/ranking')
export class RankingController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 캐릭터 경험치 랭킹 조회
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
      LIMIT 200
      `;

      const user: any = rankings.filter(ranking => ranking.userId === currentUser.userId)[0];
      if (user) user.totalCount = rankings.length;

      return { user, rankings: rankings };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
