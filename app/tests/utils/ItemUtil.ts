import { PrismaClient } from '@prisma/client';
import { AddItem } from '../../src/validations/ItemValidation';

// Key 값 검사
export const assertItem = (item: any) => {
  expect(item).toMatchObject({
    itemId: item.itemId,
    name: item.name,
    description: item.description,
    level: item.level,
    img: item.img,
  });
};

// 아이템 생성 모듈
export const createItem = async (prisma: PrismaClient, item: AddItem) => {
  const newItem = await prisma.item.create({
    data: {
      name: item.name,
      description: item.description,
      level: item.level,
      link: item.link,
    },
  });
  return newItem;
};
