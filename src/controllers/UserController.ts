import { PrismaClient } from '@prisma/client';
import { CurrentUser, Delete, Get, HttpError, JsonController } from 'routing-controllers';
import { v4 as uuid } from 'uuid';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
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
  public async getUser(@CurrentUser() currentUser: any) {
    try {
      const user = await this.prisma.user.findOne({
        where: {
          userId: currentUser,
        },
      });
      if (user === null) throw new BadRequestError('사용자를 찾을 수 없습니다.');
      return user;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 회원 탈퇴 API
  @Delete('/users')
  public async deleteUser(@CurrentUser() currentUser: any) {
    try {
      const user = await this.prisma.user.findOne({
        where: {
          userId: currentUser,
        },
      });
      if (user === null) throw new BadRequestError('사용자를 찾을 수 없습니다.');

      await this.prisma.user.delete({
        where: {
          userId: currentUser,
        },
      });
      return { message: 'Delete User Success' };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
