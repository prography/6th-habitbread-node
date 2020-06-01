import { PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import { Body, CurrentUser, Delete, Get, HttpError, JsonController, Patch } from 'routing-controllers';
import { v4 as uuid } from 'uuid';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
import { CalculateUser } from '../validations/UserValidation';
import { BaseController } from './BaseController';
const id: string = uuid();

@JsonController()
export class UserController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 임시: prod 환경 Nginx 테스팅
  @Get('/')
  public index() {
    return `Hello TypeScript & Express :)\n ${id}`;
  }

  // 사용자 정보 검색 API
  @Get('/users')
  public async getUser(@CurrentUser() currentUser: User) {
    delete currentUser.oauthKey;
    delete currentUser.fcmToken;
    return currentUser;
  }

  // 사용자 경험치 계산 API
  @Patch('/users/calculate')
  public async calculateExp(@CurrentUser() currentUser: User, @Body() body: CalculateUser) {
    try {
      const bodyErrors = await validate(body);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

      const exp: number = currentUser.exp + body.exp;
      const user = await this.prisma.user.update({
        where: { userId: currentUser.userId },
        data: { exp },
      });
      delete user.oauthKey;
      delete user.fcmToken;
      return user;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 회원 탈퇴 API
  @Delete('/users')
  public async deleteUser(@CurrentUser() currentUser: User) {
    try {
      await this.prisma.user.delete({
        where: {
          userId: currentUser.userId,
        },
      });
      return { message: 'Delete User Success' };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
