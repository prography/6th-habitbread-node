// import { PrismaClient } from '@prisma/client';
// import { validate } from 'class-validator';
// import { Body, CurrentUser, Delete, Get, HttpCode, HttpError, JsonController, Patch, Post } from 'routing-controllers';
// import { BadRequestError, InternalServerError, NotFoundError } from '../exceptions/Exception';
// import { CalculateCharacter } from '../validations/CharacterValidation';
// import { BaseController } from './BaseController';

// @JsonController('/characters')
// export class CharacterController extends BaseController {
//   private prisma: PrismaClient;

//   constructor() {
//     super();
//     this.prisma = new PrismaClient();
//   }

//   // 특정 사용자의 모든 캐릭터 조회 API
//   // @Get()
//   // public async index() {
//   //   // TODO: 추후 한 사용자가 여러 캐릭터를 가질 수 있을 경우 구현
//   // }

//   // 특정 사용자의 특정 캐릭터 조회 API
//   @Get()
//   public async findCharacter(@CurrentUser() currentUser: any) {
//     try {
//       const character = await this.prisma.character.findOne({
//         where: { userId: currentUser },
//       });
//       if (character === null) throw new NotFoundError('캐릭터를 찾을 수 없습니다.');
//       return character;
//     } catch (err) {
//       if (err instanceof HttpError) throw err;
//       throw new InternalServerError(err.message);
//     }
//   }

//   // 캐릭터 생성 API
//   @Post()
//   @HttpCode(201)
//   public async createCharacter(@CurrentUser() currentUser: any) {
//     try {
//       const user = await this.prisma.user.findOne({
//         where: { userId: currentUser },
//         select: {
//           characters: true,
//         },
//       });
//       if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
//       if (user.characters.length !== 0) throw new BadRequestError('이미 캐릭터를 가지고 있습니다.');

//       return await this.prisma.character.create({
//         data: {
//           characterId: getRandomInt(1, 100000),
//           exp: 0,
//           users: {
//             connect: { userId: currentUser },
//           },
//         },
//       });
//     } catch (err) {
//       if (err instanceof HttpError) throw err;
//       throw new InternalServerError(err.message);
//     }
//   }

//   // 캐릭터 경험치 계산 API
//   @Patch('/calculate')
//   public async calculateExp(@CurrentUser() currentUser: any, @Body() calculate: CalculateCharacter) {
//     try {
//       const bodyErrors = await validate(calculate);
//       if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

//       const user = await this.prisma.user.findOne({
//         where: { userId: currentUser },
//         select: {
//           characters: true,
//         },
//       });
//       if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
//       if (user.characters.length === 0) throw new NotFoundError('사용자의 캐릭터를 찾을 수 없습니다.');

//       const exp: number = user.characters[0].exp + calculate.value;
//       return await this.prisma.character.update({
//         where: { userId: currentUser },
//         data: {
//           exp,
//         },
//       });
//     } catch (err) {
//       if (err instanceof HttpError) throw err;
//       throw new InternalServerError(err.message);
//     }
//   }

//   // 특정 캐릭터 삭제 API
//   @Delete()
//   public async deleteCharacter(@CurrentUser() currentUser: any) {
//     try {
//       const user = await this.prisma.user.findOne({
//         where: { userId: currentUser },
//         select: {
//           characters: true,
//         },
//       });
//       if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
//       if (user.characters.length === 0) throw new NotFoundError('사용자의 캐릭터를 찾을 수 없습니다.');

//       await this.prisma.character.delete({
//         where: {
//           characterId: user.characters[0].characterId,
//         },
//       });
//       return { message: 'Delete Character Success' };
//     } catch (err) {
//       if (err instanceof HttpError) throw err;
//       throw new InternalServerError(err.message);
//     }
//   }
// }

// //임시
// function getRandomInt(min: number, max: number) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min)) + min;
// }
