import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import { CurrentUser, Get, HttpCode, HttpError, JsonController, Param, Params, Post } from 'routing-controllers';
import { BadRequestError, InternalServerError, NoContent, NotFoundError } from '../exceptions/Exception';
import { ItemID } from '../validations/ItemValidation';
import { BaseController } from './BaseController';

@JsonController('/user/items')
export class UserItemController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 특정 사용자의 모든 아이템 조회 API
  @Get()
  public async index(@CurrentUser() currentUser: any) {
    try {
      const items = await this.prisma.userItem.findMany({
        where: {
          userId: currentUser,
        },
        include: {
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
  public async findUserItem(@CurrentUser() currentUser: any, @Params() id: ItemID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const item = await this.prisma.userItem.findMany({
        where: {
          userId: currentUser,
          itemId: id.itemId,
        },
        include: {
          item: true,
        },
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
  public async createUserItem(@CurrentUser() currentUser: any, @Param('itemId') id: ItemID) {
    try {
      return await this.prisma.userItem.create({
        data: {
          user: {
            connect: { userId: currentUser },
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

  // // 캐릭터 경험치 계산 API
  // @Patch('/calculate')
  // public async calculateExp(@CurrentUser() currentUser: any, @Body() calculate: CalculateCharacter) {
  //   try {
  //     const bodyErrors = await validate(calculate);
  //     if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

  //     const user = await this.prisma.user.findOne({
  //       where: { userId: currentUser },
  //       select: {
  //         characters: true,
  //       },
  //     });
  //     if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
  //     if (user.characters.length === 0) throw new NotFoundError('사용자의 캐릭터를 찾을 수 없습니다.');

  //     const exp: number = user.characters[0].exp + calculate.value;
  //     return await this.prisma.character.update({
  //       where: { userId: currentUser },
  //       data: {
  //         exp,
  //       },
  //     });
  //   } catch (err) {
  //     if (err instanceof HttpError) throw err;
  //     throw new InternalServerError(err.message);
  //   }
  // }

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

//임시
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
