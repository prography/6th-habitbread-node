import { User } from '@prisma/client';
import { validate } from 'class-validator';
import { MulterError } from 'multer';
import { Body, CurrentUser, Delete, Get, HttpError, JsonController, Patch, Post, UploadedFile } from 'routing-controllers';
import { v4 as uuid } from 'uuid';
import { UserInfo } from '../@types/Types';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
import { errorService } from '../services/LogService';
import { UserService } from '../services/UserService';
import { ImageDto } from '../validations/ImageValidation';
import { UserRequestDto } from '../validations/UserValidation';
import { BaseController } from './BaseController';

const id: string = uuid();

@JsonController()
export class UserController extends BaseController {
  private userService: UserService;
  private allowedMimeTypes: string[];
  constructor() {
    super();
    this.userService = new UserService();
    this.allowedMimeTypes = ['image/png', 'image/jpeg', 'image/bmp', 'image/jpg'];
  }

  // 임시: prod 환경 Nginx 테스팅
  @Get('/')
  public index() {
    return `Hello TypeScript & Express :)\n ${id}`;
  }

  // 사용자 정보 검색 API
  @Get('/users')
  public async getUser(@CurrentUser() currentUser: UserInfo) {
    return await this.userService.findUser(currentUser);
  }

  // 닉네임 , 경험치 계산, FCM Token 업데이트
  @Patch('/users')
  public async patchUser(@CurrentUser() currentUser: User, @Body() body: UserRequestDto) {
    try {
      const bodyErrors = await validate(body, { skipMissingProperties: true });
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);
      return await this.userService.updateUser(currentUser, body);
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 이미지 업로드
  @Post('/users/image')
  public async updateImage(@CurrentUser() currentUser: User, @UploadedFile('file') file: ImageDto) {
    try {
      if (!this.allowedMimeTypes.includes(file.mimetype)) throw new BadRequestError('지원하지 않는 이미지 형식입니다.');
      return await this.userService.updateImage(currentUser, file);
    } catch (err) {
      if (err instanceof MulterError) throw err;
      if (err instanceof HttpError) throw err;
      console.error(err);
    }
  }

  // 회원 탈퇴 API
  @Delete('/users')
  public async deleteUser(@CurrentUser() currentUser: User) {
    try {
      return await this.userService.deleteUser(currentUser);
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
