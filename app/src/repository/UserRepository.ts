import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../repository/BaseRepository';

export class UserRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  public countUserItem(userId: number) {
    return this.prisma.userItem.count({ where: { userId } });
  }

  public updateUserDataById(userId: number, payload: any) {
    return this.prisma.user.update({
      where: { userId },
      data: payload,
    });
  }

  public deleteUserById(userId: number) {
    return this.prisma.raw`delete from users where user_id = ${userId};`;
  }
}
