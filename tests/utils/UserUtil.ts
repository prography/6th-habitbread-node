import { PrismaClient } from '@prisma/client';
import { AddUser } from '../../src/validations/UserValidation';

// 사용자 생성 모듈
export const createUser = async (prisma: PrismaClient, user: AddUser) => {
  const newUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      oauthKey: user.email,
    },
  });
  return newUser;
};
