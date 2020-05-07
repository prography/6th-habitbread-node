import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
dotenv.config({ path: `${__dirname}/../../.env.dev` });

const prisma = new PrismaClient();

// await prisma.character.deleteMany({});
// const user1 = await createUser(prisma, new AddUser('tomas', 'tomas@naver.com'));
// const user2 = await createUser(prisma, new AddUser('ed', 'ed@naver.com'));
// await createCharacter(prisma, new AddCharacter(1), 1);
// await createCharacter(prisma, new AddCharacter(21), 2);
// await createCharacter(prisma, new AddCharacter(user1.userId), 3);
// await createCharacter(prisma, new AddCharacter(user2.userId), 4);

// await prisma.character.update({
//   where: {
//     userId: 1,
//   },
//   data: {
//     exp: 10000,
//   },
// });

// 1시간 마다 모든 사용자의 캐릭터 경험치를 조회한 후 Rank 테이블 갱신
schedule.scheduleJob('0 * * * *', async () => {
  console.log('랭킹 업데이트 스케줄러 시작 !');
  try {
    const characters = await prisma.character.findMany({
      select: {
        characterId: true,
        exp: true,
        users: true,
      },
    });

    characters.forEach(async character => {
      const userName = character.users.name;
      const exp = character.exp;

      await prisma.ranking.upsert({
        where: {
          rankingId: character.characterId, // develop 수정 -> characterId or userId 로 찾도록
        },
        create: {
          rankingId: character.characterId,
          userName,
          exp,
        },
        update: {
          userName,
          exp,
        },
      });
    });
  } catch (err) {
    throw new Error(err.message);
  }

  console.log('랭킹 업데이트 스케줄러 종료 :)');
});
