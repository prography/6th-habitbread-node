import { PrismaClient } from '@prisma/client';
import { Get, HttpError, JsonController } from 'routing-controllers';
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
  public async index() {
    try {
      const rankings = await this.prisma.ranking.findMany({
        orderBy: {
          exp: 'desc',
        },
      });
      if (rankings === null) throw new NoContent('');
      return rankings;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
