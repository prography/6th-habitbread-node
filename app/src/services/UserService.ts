import { User } from '@prisma/client';
import { UserInfo } from '../@types/Types';
import { UserRepository } from '../repository/UserRepository';
import { LevelUtil } from '../utils/LevelUtil';
import RedisUtil from '../utils/RedisUtil';
import { GetUserRequestDto } from '../validations/UserValidation';
import { BaseServices } from './BaseServices';

export class UserService extends BaseServices {
  private levelUtil: any;
  private redis: RedisUtil;
  private userRepository: UserRepository;

  constructor() {
    super();
    this.levelUtil = LevelUtil.getInstance();
    this.redis = RedisUtil.getInstance();
    this.userRepository = new UserRepository();
  }

  async findUser(currentUser: UserInfo) {
    const { percent } = this.levelUtil.getLevelsAndPercents(currentUser.exp);
    currentUser.percent = percent;
    currentUser.itemTotalCount = await this.userRepository.countUserItem(currentUser.userId);
    delete currentUser.oauthKey;
    delete currentUser.fcmToken;
    return currentUser;
  }

  async updateUser(currentUser: User, dto: GetUserRequestDto) {
    const name = dto.name || currentUser.name;

    const userInfo: any = {};
    userInfo.name = name;
    userInfo.exp = currentUser.exp;
    userInfo.isAlarmOn = dto.fcmToken ? '1' : '0';
    userInfo.FCMToken = dto.fcmToken || 'null';
    await this.redis.hmset(`user:${currentUser.userId}`, userInfo);
    const payload: any = {};
    payload.name = name;
    payload.fcmToken = dto.fcmToken;

    const user = await this.userRepository.updateUserDataById(currentUser.userId, payload);
    delete user.oauthKey;
    delete user.fcmToken;

    return user;
  }

  async deleteUser(currentUser: User) {
    await this.redis.del(`user:${currentUser.userId}`);
    await this.redis.zrem('user:score', `user:${currentUser.userId}`);
    await this.userRepository.deleteUserById(currentUser.userId);

    return { message: 'Delete User Success' };
  }
}
