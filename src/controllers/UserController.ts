import { PrismaClient } from '@prisma/client';
import { CurrentUser, Get, JsonController } from 'routing-controllers';
import { v4 as uuid } from 'uuid';
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

  // 사용자 전체 검색 API
  @Get('/users')
  public async user(@CurrentUser() currentUser: any) {
    return await this.prisma.user.findOne({
      where: {
        userId: currentUser,
      },
    });
  }
}
