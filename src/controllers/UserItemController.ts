import { Item, PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import { CurrentUser, Delete, Get, HttpCode, HttpError, JsonController, Params, Post } from 'routing-controllers';
import { BadRequestError, InternalServerError, NoContent, NotFoundError } from '../exceptions/Exception';
import { RandomUtil } from '../utils/RandomUtil';
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
  // 랜덤으로 사용자에게 빵 레벨별로 생성
  @Post()
  @HttpCode(201)
  public async createUserItem(@CurrentUser() currentUser: User) {
    try {
      // 내가 어떤 레벨의 빵을 가져올지
      const breads = [
        { level: 1, weight: 0.5 },
        { level: 2, weight: 0.3 },
        { level: 3, weight: 0.15 },
        { level: 4, weight: 0.05 },
      ];

      const items = await this.prisma.item.findMany();
      const userItems = await this.prisma.userItem.findMany({
        where: {
          userId: currentUser.userId,
        },
        include: {
          item: true,
        },
      });
      if (items.length === userItems.length) return { message: '모든 빵 아이템을 가지고 있습니다.' };

      let selected: Item;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // 빵 Level 랜덤 픽
        const bread = RandomUtil.pickLevelOne(breads);
        const newItems = items.filter(item => item.level === bread.level);
        if (newItems.length === 0) continue;
        selected = RandomUtil.pickItemOne(newItems);

        // ID가 같으면 이미 있는 아이템
        const overlap = userItems.filter(item => item.item.itemId === selected.itemId);
        if (overlap.length === 0) break;
      }

      return await this.prisma.userItem.create({
        data: {
          user: {
            connect: { userId: currentUser.userId },
          },
          item: {
            connect: { itemId: selected.itemId },
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
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
