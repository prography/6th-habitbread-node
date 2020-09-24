import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class OAuthRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  public async findOrUpdateUser(data: { userName: string; oauthKey: string }) {
    let isNewUser = false;
    let user = await this.prisma.user.findOne({
      where: { oauthKey: data.oauthKey },
    });
    if (user === null) {
      user = await this.prisma.user.create({
        data,
      });
      isNewUser = true;
    }
    return { user, isNewUser };
  }
}
