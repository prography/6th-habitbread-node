import { PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import { Body, CurrentUser, Delete, Get, HttpCode, HttpError, JsonController, Params, Post } from 'routing-controllers';
import { BadRequestError, InternalServerError, NoContent, NotFoundError } from '../exceptions/Exception';
import { ItemID } from '../validations/ItemValidation';
import { UserItemID } from '../validations/UserItemValidation';
import { BaseController } from './BaseController';

@JsonController('/users/items')
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
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 특정 사용자의 아이템 생성 API
  // TODO: 예시 추후 랜덤으로 사용자에게 빵 레벨별로 생성해야함!
  @Post()
  @HttpCode(201)
  public async createUserItem(@CurrentUser() currentUser: User, @Body() body: ItemID) {
    try {
      const bodyErrors = await validate(body);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

      return await this.prisma.userItem.create({
        data: {
          user: {
            connect: { userId: currentUser.userId },
          },
          item: {
            connect: { itemId: body.itemId },
          },
        },
      });
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 특정 사용자의 아이템 삭제 API
  @Delete('/:userItemId')
  public async deleteCharacter(@CurrentUser() currentUser: User, @Params() id: UserItemID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      await this.prisma.userItem.delete({ where: { userItemId: id.userItemId } });

      return { message: 'Delete Character Success' };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
