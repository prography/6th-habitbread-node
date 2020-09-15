import { PrismaClient, User } from '@prisma/client';
import { UserInfo } from '../@types/Types';
import { LevelUtil } from '../utils/LevelUtil';
import RedisUtil from '../utils/RedisUtil';
import { GetUserBodyDto } from '../validations/UserDto';

export class UserService {
  private levelUtil: any;
  private prisma: PrismaClient;
  private redis: RedisUtil;

  constructor() {
    this.levelUtil = LevelUtil.getInstance();
    this.prisma = new PrismaClient();
    this.redis = RedisUtil.getInstance();
  }

  async getItemTotalCount(currentUser: UserInfo) {
    const { percent } = this.levelUtil.getLevelsAndPercents(currentUser.exp);
    currentUser.percent = percent;
    currentUser.itemTotalCount = await this.prisma.userItem.count({ where: { userId: currentUser.userId } });
    delete currentUser.oauthKey;
    delete currentUser.fcmToken;
    return currentUser;
  }

  async patchUserInfoInRedisAndMysql(currentUser: User, body: GetUserBodyDto) {
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
  }

  async deleteUserInRedisAndMysql(currentUser: User) {
    await this.redis.del(`user:${currentUser.userId}`);
    await this.redis.zrem('user:score', `user:${currentUser.userId}`);
    await this.prisma.raw`delete from users where user_id = ${currentUser.userId};`;

    return { message: 'Delete User Success' };
  }
}
