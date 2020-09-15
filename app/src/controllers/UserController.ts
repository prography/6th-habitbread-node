import { User } from '@prisma/client';
import { validate } from 'class-validator';
import { Body, CurrentUser, Delete, Get, HttpError, JsonController, Patch } from 'routing-controllers';
import { v4 as uuid } from 'uuid';
import { UserInfo } from '../@types/Types';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
import { errorService } from '../services/LogService';
import { UserService } from '../services/UserService';
import { GetUserBodyDto } from '../validations/UserDto';
import { BaseController } from './BaseController';
const id: string = uuid();

@JsonController()
export class UserController extends BaseController {
  private userService: UserService;
  constructor() {
    super();
    this.userService = new UserService();
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
  public async patchUser(@CurrentUser() currentUser: User, @Body() body: GetUserBodyDto) {
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
