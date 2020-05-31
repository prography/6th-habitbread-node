import { PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import { CurrentUser, Get, HttpCode, HttpError, JsonController, Param, Params, Post } from 'routing-controllers';
import { BadRequestError, InternalServerError, NoContent, NotFoundError } from '../exceptions/Exception';
import { ItemID } from '../validations/ItemValidation';
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
  @Get('/:itemId')
  public async findUserItem(@CurrentUser() currentUser: User, @Params() id: ItemID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const item = await this.prisma.userItem.findMany({
        where: {
          userId: currentUser.userId,
          itemId: id.itemId,
        },
        select: {
          item: true,
          createdAt: true,
        },
        first: 1,
      });
      if (item.length === 0) throw new NotFoundError('빵 아이템을 찾을 수 없습니다.');

      return item[0];
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 특정 사용자의 아이템 생성 API
  // TODO: '/:itemId' 는 예시 추후 랜덤으로 사용자에게 빵 레벨별로 생성해야함!
  @Post('/:itemId')
  @HttpCode(201)
  public async createUserItem(@CurrentUser() currentUser: User, @Param('itemId') id: ItemID) {
    try {
      return await this.prisma.userItem.create({
        data: {
          user: {
            connect: { userId: currentUser.userId },
          },
          item: {
            connect: { itemId: id.itemId },
          },
        },
      });
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // // 특정 캐릭터 삭제 API
  // @Delete()
  // public async deleteCharacter(@CurrentUser() currentUser: any) {
  //   try {
  //     const user = await this.prisma.user.findOne({
  //       where: { userId: currentUser },
  //       select: {
  //         characters: true,
  //       },
  //     });
  //     if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
  //     if (user.characters.length === 0) throw new NotFoundError('사용자의 캐릭터를 찾을 수 없습니다.');

  //     await this.prisma.character.delete({
  //       where: {
  //         characterId: user.characters[0].characterId,
  //       },
  //     });
  //     return { message: 'Delete Character Success' };
  //   } catch (err) {
  //     if (err instanceof HttpError) throw err;
  //     throw new InternalServerError(err.message);
  //   }
  // }
}
