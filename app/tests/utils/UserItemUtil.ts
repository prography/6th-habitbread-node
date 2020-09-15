import { PrismaClient } from '@prisma/client';
import { JsonResponse } from '../../src/@types/Types';
import { AddUserItem } from '../../src/validations/UserItemValidation';

// Key 값 검사
export const assertUserItem = (_item: JsonResponse) => {
  expect(_item).toMatchObject({
    userItemId: _item.userItemId,
    createdAt: _item.createdAt,
    item: _item.item,
  });
};

// 사용자의 아이템 생성 모듈
export const createUserItem = async (prisma: PrismaClient, userItem: AddUserItem) => {
  const newUserItem = await prisma.userItem.create({
    data: {
      user: {
        connect: { userId: userItem.userId },
      },
      item: {
        connect: { itemId: userItem.itemId },
      },
    },
  });
  return newUserItem;
};
