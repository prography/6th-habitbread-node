import { Item, PrismaClient, User } from '@prisma/client';
import { Util } from './BaseUtil';
import { RandomUtil } from './RandomUtil';

export class UserItemUtil extends Util {
  // 특정 사용자의 아이템 생성 API
  // 랜덤으로 사용자에게 빵 레벨별로 생성
  public async createItem(prisma: PrismaClient, currentUser: User) {
    // 내가 어떤 레벨의 빵을 가져올지
    const breads = [
      { level: 1, weight: 0.5 },
      { level: 2, weight: 0.3 },
      { level: 3, weight: 0.15 },
      { level: 4, weight: 0.05 },
    ];

    const items = await prisma.item.findMany();
    const userItems = await prisma.userItem.findMany({
      where: {
        userId: currentUser.userId,
      },
      include: {
        item: true,
      },
    });
    if (items.length === 0) return { message: '서버의 아이템이 없습니다.' };
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

    const userItem = await prisma.userItem.create({
      data: {
        user: {
          connect: { userId: currentUser.userId },
        },
        item: {
          connect: { itemId: selected.itemId },
        },
      },
      select: {
        item: true,
      },
    });
    return userItem.item;
  }
}
