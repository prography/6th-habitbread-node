import { User } from '@prisma/client';
import * as AWS from 'aws-sdk';
import { S3 } from 'aws-sdk';
import moment from 'moment';
import { UserInfo } from '../@types/Types';
import env from '../configs/index';
import RedisRepository from '../repository/RedisRepository';
import { UserRepository } from '../repository/UserRepository';
import { LevelUtil } from '../utils/LevelUtil';
import { ImageDto } from '../validations/ImageValidation';
import { UserRequestDto } from '../validations/UserValidation';
import { BaseService } from './BaseService';
require('moment-timezone');

export class UserService extends BaseService {
  private levelUtil: LevelUtil;
  private redis: RedisRepository;
  private userRepository: UserRepository;
  private s3: S3;

  constructor() {
    super();
    moment.tz.setDefault('Asia/Seoul');
    this.levelUtil = new LevelUtil();
    this.redis = new RedisRepository();
    this.userRepository = new UserRepository();
    this.s3 = new AWS.S3(env.AWS);
  }

  public async findUser(currentUser: UserInfo) {
    const { percent } = this.levelUtil.getLevelsAndPercents(currentUser.exp);
    currentUser.percent = percent;
    currentUser.itemTotalCount = await this.userRepository.countItem(currentUser.userId);
    delete currentUser.oauthKey;
    delete currentUser.fcmToken;
    return currentUser;
  }

  public async updateUser(currentUser: User, dto: UserRequestDto) {
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

  public async updateImage(currentUser: User, file: ImageDto) {
    const user = await this.userRepository.findByOAuthKey(currentUser.oauthKey);
    const originalImage = user?.image?.split('.com/')[1] as string;
    if (originalImage) {
      const paramsForDelete = {
        Bucket: 'habitbread', // 사용자 버켓 이름
        Key: originalImage, // 버켓 내 경로
      };
      await this.s3.deleteObject(paramsForDelete).promise();
    }
    const key = `user/${moment().format('YYYYMMDDhhmmss')}_${file.originalname}`;
    const paramsForUpload: AWS.S3.PutObjectRequest = {
      Bucket: 'habitbread',
      Key: key,
      Body: file.buffer,
    };

    const uploadImage = await this.s3.upload(paramsForUpload).promise();
    return await this.userRepository.updateImage(uploadImage.Location, currentUser.userId);
  }
}
