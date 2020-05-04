import { PrismaClient } from '@prisma/client';
import { AddUser } from '../../src/validations/UserValidation';

export const createUser = async (prisma: PrismaClient, user: AddUser) => {
  const new_user = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
    },
  });
  return new_user;
};
