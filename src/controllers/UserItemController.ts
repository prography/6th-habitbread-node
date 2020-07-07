import { PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import { CurrentUser, Delete, Get, HttpError, JsonController, Params } from 'routing-controllers';
import { BadRequestError, InternalServerError, NoContent, NotFoundError } from '../exceptions/Exception';
import { errorService } from '../services/LogService';
import { UserItemID } from '../validations/UserItemValidation';
import { BaseController } from './BaseController';

@JsonController('/items')
export class UserItemController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 특정 사용자의 모든 아이템 조회 API
  @Get()
  public async index(@CurrentUser() currentUser: User) {
    try {
      const items = await this.prisma.userItem.findMany({
        where: { userId: currentUser.userId },
        select: {
          userItemId: true,
          createdAt: true,
          item: true,
        },
      });
      if (items.length === 0) throw new NoContent('');

      return items;
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 특정 사용자의 특정 아이템 조회 API
  @Get('/:userItemId')
  public async findUserItem(@CurrentUser() currentUser: User, @Params() id: UserItemID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const item = await this.prisma.userItem.findOne({
        where: { userItemId: id.userItemId },
        select: {
          userItemId: true,
          createdAt: true,
          item: true,
        },
      });
      if (item === null) throw new NotFoundError('빵 아이템을 찾을 수 없습니다.');

      return item;
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 특정 사용자의 아이템 삭제 API
  @Delete('/:userItemId')
  public async deleteUserItem(@CurrentUser() currentUser: User, @Params() id: UserItemID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const item = await this.prisma.userItem.findOne({
        where: { userItemId: id.userItemId },
      });
      if (item === null) throw new NotFoundError('빵 아이템을 찾을 수 없습니다.');

      await this.prisma.raw`delete from user_item where user_item_id = ${id.userItemId};`;

      return { message: "Delete User's Item Success" };
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
