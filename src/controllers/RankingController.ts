// import { PrismaClient } from '@prisma/client';
// import { Response } from 'express';
// import { Get, HttpError, JsonController, Res } from 'routing-controllers';
// import { InternalServerError, NoContent } from '../exceptions/Exception';
// import { BaseController } from './BaseController';

// @JsonController('/ranking')
// export class RankingController extends BaseController {
//   private prisma: PrismaClient;

//   constructor() {
//     super();
//     this.prisma = new PrismaClient();
//   }

//   // 캐릭터 경험치 랭킹 조회
//   @Get()
//   public async index(@Res() res: Response) {
//     try {
//       const character = await this.prisma.ranking.findMany({
//         orderBy: {
//           exp: 'desc',
//         },
//       });
//       if (character === null) throw new NoContent('');
//       return character;
//     } catch (err) {
//       if (err instanceof HttpError) return res.status(err.httpCode).send(err);
//       throw new InternalServerError(err.message);
//     }
//   }
// }
