import { PrismaClient } from '@prisma/client';
import { AddCharacter } from '../../src/validations/CharacterValidation';

export const assertCharacter = (item: any) => {
  const expectKeys = ['characterId', 'userId', 'exp'];
  Object.keys(item).forEach(key => {
    const idx = expectKeys.indexOf(key);
    if (idx > -1) {
      expectKeys.splice(idx, 1);
    }
  });
  expect(expectKeys.length).toBe(0);
};

export const createCharacter = async (prisma: PrismaClient, character: AddCharacter, id: number) => {
  const new_character = await prisma.character.create({
    data: {
      characterId: id,
      exp: character.exp,
      users: {
        connect: {
          userId: character.userId,
        },
      },
    },
  });
  return new_character;
};
