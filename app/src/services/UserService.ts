import { User } from '@prisma/client';
import { UserInfo } from '../@types/Types';
import RedisRepository from '../repository/RedisRepository';
import { UserRepository } from '../repository/UserRepository';
import { LevelUtil } from '../utils/LevelUtil';
import { GetUserRequestDto } from '../validations/UserValidation';
import { BaseService } from './BaseService';

export class UserService extends BaseService {
  private levelUtil: any;
  private redis: RedisRepository;
  private userRepository: UserRepository;

  constructor() {
    super();
    this.levelUtil = LevelUtil.getInstance();
    this.redis = RedisRepository.getInstance();
    this.userRepository = new UserRepository();
  }

  public async findUser(currentUser: UserInfo) {
    const { percent } = this.levelUtil.getLevelsAndPercents(currentUser.exp);
    currentUser.percent = percent;
    currentUser.itemTotalCount = await this.userRepository.countItem(currentUser.userId);
    delete currentUser.oauthKey;
    delete currentUser.fcmToken;
    return currentUser;
  }

  public async updateUser(currentUser: User, dto: GetUserRequestDto) {
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

    const user = await this.userRepository.updateById(currentUser.userId, payload);
    delete user.oauthKey;
    delete user.fcmToken;

    return user;
  }

  public async deleteUser(currentUser: User) {
    await this.redis.del(`user:${currentUser.userId}`);
    await this.redis.zrem('user:score', `user:${currentUser.userId}`);
    await this.userRepository.deleteById(currentUser.userId);

    return { message: 'Delete User Success' };
  }
}
