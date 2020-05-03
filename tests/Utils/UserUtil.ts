import { PrismaClient } from '@prisma/client';
import { User } from '../../src/validations/UserValidation';

export const createUser = async (prisma: PrismaClient, user: User) => {
  const new_user = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
    },
  });
  return new_user;
};
