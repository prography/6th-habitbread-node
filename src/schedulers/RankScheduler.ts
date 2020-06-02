// import { PrismaClient } from '@prisma/client';
// import schedule from 'node-schedule';

// const prisma = new PrismaClient();

// const scheduler = {
//   // 1시간 마다 모든 사용자의 캐릭터 경험치를 조회한 후 Rank 테이블 갱신
//   RankingUpdateJob: () => {
//     console.log('랭킹 업데이트 스케줄러 설정 완료 :)');

//     schedule.scheduleJob('*/10 * * * * *', async () => {
//       console.log('랭킹 업데이트 시작 !');
//       try {
//         const users = await prisma.user.findMany();

//         users.forEach(async user => {
//           const nickName = user.name;
//           const exp = user.exp;

//           await prisma.ranking.upsert({
//             where: {
//               rankingId: character.characterId, // develop 수정 -> characterId or userId 로 찾도록
//             },
//             create: {
//               rankingId: character.characterId,
//               userName,
//               exp,
//             },
//             update: {
//               userName,
//               exp,
//             },
//           });
//         });
//       } catch (err) {
//         throw new Error(err.message);
//       }

//       console.log('랭킹 업데이트 종료 :)');
//     });
//   },
// };

// export default scheduler;
