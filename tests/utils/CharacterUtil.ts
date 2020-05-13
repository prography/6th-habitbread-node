import { PrismaClient } from '@prisma/client';
import { AddCharacter } from '../../src/validations/CharacterValidation';

export const assertCharacter = (item: any) => {
  expect(item).toMatchObject({
    characterId: item.characterId,
    userId: item.userId,
    exp: item.exp,
  });
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
