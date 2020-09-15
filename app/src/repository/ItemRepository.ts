import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepositoy';

export class ItemRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  public async findById(userItemId: number) {
    return this.prisma.userItem.findOne({
      where: { userItemId },
    });
  }

  public async findByIdJoinItem(userItemId: number) {
    return this.prisma.userItem.findOne({
      where: { userItemId },
      select: {
        userItemId: true,
        createdAt: true,
        item: true,
      },
    });
  }

  public async findAllByUserIdJoinItem(userId: number) {
    return this.prisma.userItem.findMany({
      where: { userId },
      select: {
        userItemId: true,
        createdAt: true,
        item: true,
      },
    });
  }

  public async deleteById(userItemId: number) {
    await this.prisma.raw`delete from user_item where user_item_id = ${userItemId};`;
  }
}
