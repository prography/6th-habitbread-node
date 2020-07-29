import { PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import { Body, CurrentUser, Delete, Get, HttpError, JsonController, Patch } from 'routing-controllers';
import { v4 as uuid } from 'uuid';
import { UserInfo } from '../@types/types-custom';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
import { errorService } from '../services/LogService';
import { LevelUtil } from '../utils/LevelUtil';
import RedisUtil from '../utils/RedisUtil';
import { GetUserBody } from '../validations/UserValidation';
import { BaseController } from './BaseController';
const id: string = uuid();

@JsonController()
export class UserController extends BaseController {
  private prisma: PrismaClient;
  private levelUtil: any;
  private redis: RedisUtil;

  constructor() {
    super();
    this.levelUtil = LevelUtil.getInstance();
    this.prisma = new PrismaClient();
    this.redis = RedisUtil.getInstance();
  }

  // 임시: prod 환경 Nginx 테스팅
  @Get('/')
  public index() {
    return `Hello TypeScript & Express :)\n ${id}`;
  }

  // 사용자 정보 검색 API
  @Get('/users')
  public async getUser(@CurrentUser() currentUser: UserInfo) {
    const { percent } = this.levelUtil.getLevelsAndPercents(currentUser.exp);
    currentUser.percent = percent;
    currentUser.itemTotalCount = await this.prisma.userItem.count({ where: { userId: currentUser.userId } });
    delete currentUser.oauthKey;
    delete currentUser.fcmToken;
    return currentUser;
  }

  // 닉네임 , 경험치 계산, FCM Token 업데이트
  @Patch('/users')
  public async patchUser(@CurrentUser() currentUser: User, @Body() body: GetUserBody) {
    try {
      const bodyErrors = await validate(body, { skipMissingProperties: true });
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

      const name = body.name || currentUser.name;

      const userInfo: any = {};
      userInfo.name = name;
      userInfo.exp = currentUser.exp;
      userInfo.isAlarmOn = body.fcmToken ? '1' : '0';
      userInfo.FCMToken = body.fcmToken || 'null';
      await this.redis.hmset(`user:${currentUser.userId}`, userInfo);

      const payload: any = {};
      payload.name = name;
      payload.fcmToken = body.fcmToken;

      const user = await this.prisma.user.update({
        where: { userId: currentUser.userId },
        data: payload,
      });
      delete user.oauthKey;
      delete user.fcmToken;
      return user;
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 회원 탈퇴 API
  @Delete('/users')
  public async deleteUser(@CurrentUser() currentUser: User) {
    try {
      await this.redis.del(`user:${currentUser.userId}`);
      await this.redis.zrem('user:score', `user:${currentUser.userId}`);
      await this.prisma.raw`delete from users where user_id = ${currentUser.userId};`;

      return { message: 'Delete User Success' };
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
