import { PrismaClient } from '@prisma/client';
import { JsonResponse } from '../../src/@types/Types';
import { AddUserDto } from '../../src/validations/UserDto';

// Key 값 검사
export const assertUser = (item: JsonResponse) => {
  expect(item).toMatchObject({
    userId: item.userId,
    name: item.name,
    exp: item.exp,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });
};

// 사용자 생성 모듈
export const createUser = async (prisma: PrismaClient, user: AddUserDto) => {
  const newUser = await prisma.user.create({
    data: {
      name: user.name,
      oauthKey: user.oauthKey,
    },
  });
  return newUser;
};

// 사용자 생성 모듈(FCM 추가)
export const createUserWithFCM = async (prisma: PrismaClient, user: AddUserDto) => {
  const newUser = await prisma.user.create({
    data: {
      name: user.name,
      oauthKey: user.oauthKey,
      fcmToken: 'asdfasdf',
    },
  });
  return newUser;
};
