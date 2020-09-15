import { PrismaClient, User } from '@prisma/client';
import { HttpError } from 'routing-controllers';
import { InternalServerError, NoContent, NotFoundError } from '../exceptions/Exception';
import { GetUserItemRequestDto } from '../validations/UserItemValidation';
import { BaseService } from './BaseService';
import { errorService } from './LogService';

export class ItemService extends BaseService {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 특정 사용자 ID로 모든 Item 가져오기
  public async findAllByUserId(user: User) {
    try {
      const items = await this.prisma.userItem.findMany({
        where: { userId: user.userId },
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

  // 특정 사용자 ID와 아이템 ID로 특정 아이템 조회
  public async findItemById(id: GetUserItemRequestDto) {
    try {
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

  // 특정 사용자의 아이템 삭제
  public async deleteById(id: GetUserItemRequestDto) {
    try {
      const item = await this.prisma.userItem.findOne({
        where: { userItemId: id.userItemId },
      });
      if (item === null) throw new NotFoundError('빵 아이템을 찾을 수 없습니다.');

      await this.prisma.raw`delete from user_item where user_item_id = ${id.userItemId};`;
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
