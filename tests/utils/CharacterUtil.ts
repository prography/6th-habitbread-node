import { Character, PrismaClient } from '@prisma/client';
import { AddCharacter } from '../../src/validations/CharacterValidation';

// Key 값 검사
export const assertCharacter = (item: Character) => {
  expect(item).toMatchObject({
    characterId: item.characterId,
    userId: item.userId,
    exp: item.exp,
  });
};

// 캐릭터 생성 모듈
export const createCharacter = async (prisma: PrismaClient, character: AddCharacter, id: number) => {
  const newCharacter = await prisma.character.create({
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
  return newCharacter;
};
