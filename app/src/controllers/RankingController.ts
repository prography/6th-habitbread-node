import { User } from '@prisma/client';
import _ from 'lodash';
import { CurrentUser, Get, JsonController } from 'routing-controllers';
import { InternalServerError } from '../exceptions/Exception';
import RedisRepository from '../repository/RedisRepository';
import { errorService } from '../services/LogService';
import { RankService } from '../services/RankService';
import { BaseController } from './BaseController';

@JsonController('/ranking')
export class RankingController extends BaseController {
  private rankService: RankService;

  constructor() {
    super();
    this.rankService = new RankService();
  }

  // 나의 랭킹 + 전체 랭킹 리스트 조회
  @Get()
  public async index(@CurrentUser() currentUser: User) {
    return this.rankService.searchRankig(currentUser);
  }
}
