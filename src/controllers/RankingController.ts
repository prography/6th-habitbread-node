import { PrismaClient, User } from '@prisma/client';
import { CurrentUser, Get, HttpError, JsonController } from 'routing-controllers';
import { InternalServerError, NoContent } from '../exceptions/Exception';
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
      const totalCount = await this.prisma.ranking.count();

      const rankings = await this.prisma.raw`
        SELECT
          r.user_id,
          r.user_name,
          r.exp,
          r.achievement,
          (SELECT COUNT(*) FROM ranking WHERE exp > r.exp) AS rank
        FROM ranking r
        WHERE r.user_id = ${currentUser.userId}
      `;
      if (rankings.length === 0) throw new NoContent('');

      const ranking = rankings[0];
      ranking.rank += 1;
      ranking.totalCount = totalCount;
      return ranking;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
