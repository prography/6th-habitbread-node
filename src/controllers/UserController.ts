import { PrismaClient } from '@prisma/client';
import { Body, Get, JsonController, Post } from 'routing-controllers';
import { v4 as uuid } from 'uuid';
import { User } from '../validations/UserValidation';
import { BaseController } from './BaseController';
const id: string = uuid();

@JsonController()
export class UserController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // prod 환경 Nginx 테스팅
  @Get('/')
  public index() {
    return `Hello TypeScript & Express :)\n ${id}`;
  }

  @Get('/users')
  public async user() {
    return await this.prisma.user.findMany(); // 전체 검색
  }

  @Post('/users')
  public async createUser(@Body({ validate: true }) user: User) {
    return await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
      },
    });
  }
}
