import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import { Response } from 'express';
import { Body, Get, HttpError, JsonController, Post, Res } from 'routing-controllers';
import { v4 as uuid } from 'uuid';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
import { AddUser } from '../validations/UserValidation';
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
  public async user() {
    return await this.prisma.user.findMany();
  }

  // 사용자 추가 API
  @Post('/users')
  public async createUser(@Body() user: AddUser, @Res() res: Response) {
    try {
      const errors = await validate(user);
      if (errors.length > 0) throw new BadRequestError(errors);

      const createUser = await this.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          oauthKey: user.email,
        },
      });

      return createUser;
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new InternalServerError(err.message);
    }
  }
}
