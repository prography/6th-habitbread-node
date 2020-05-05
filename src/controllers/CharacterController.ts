import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { Body, Delete, Get, HttpCode, HttpError, JsonController, Params, Patch, Post, Res } from 'routing-controllers';
import { BadRequestError, InternalServerError, NotFoundError } from '../exceptions/Exception';
import { CalculateCharacter } from '../validations/CharacterValidation';
import { UserID } from '../validations/UserValidation';
import { BaseController } from './BaseController';

@JsonController('/users/:userId/characters')
export class CharacterController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 특정 사용자의 모든 캐릭터 조회 API
  // @Get()
  // public async index() {
  //   // TODO: 추후 한 사용자가 여러 캐릭터를 가질 수 있을 경우 구현
  // }

  // 특정 사용자의 특정 캐릭터 조회 API
  @Get()
  public async findCharacter(@Params({ validate: true }) id: UserID, @Res() res: Response) {
    try {
      // 이런식으로 명시 해주어야 하나?
      // const character: Character[] = await this.prisma.character.find...;
      const character = await this.prisma.character.findOne({
        where: { userId: id.userId },
      });
      if (!character) throw new NotFoundError('캐릭터를 찾을 수 없습니다.');
      return character;
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new InternalServerError(err);
    }
  }

  // 캐릭터 생성 API
  @Post()
  @HttpCode(201)
  public async createCharacter(@Params({ validate: true }) id: UserID, @Res() res: Response) {
    try {
      const user = await this.prisma.user.findOne({
        where: { userId: id.userId },
        select: {
          characters: true,
        },
      });
      if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      if (user.characters.length !== 0) throw new BadRequestError('이미 캐릭터를 가지고 있습니다.'); // 1:1 관계

      return await this.prisma.character.create({
        data: {
          // @default(autoincrement()) 해야함
          characterId: getRandomInt(1, 100000),
          exp: 0,
          // user로 변경해야함
          users: {
            connect: { userId: id.userId },
          },
        },
      });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new InternalServerError(err);
    }
  }

  // 캐릭터 경험치 계산 API
  @Patch('/calculate')
  public async calculateExp(
    @Params({ validate: true }) id: UserID,
    @Body({ validate: true }) calculate: CalculateCharacter,
    @Res() res: Response
  ) {
    try {
      const user = await this.prisma.user.findOne({
        where: { userId: id.userId },
        select: {
          characters: true,
        },
      });
      if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      if (user.characters.length === 0) throw new NotFoundError('사용자의 캐릭터를 찾을 수 없습니다.'); // 1:1

      const exp: number = user.characters[0].exp + calculate.value;
      return await this.prisma.character.update({
        where: { userId: id.userId },
        data: {
          exp,
        },
      });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new InternalServerError(err);
    }
  }

  // 특정 캐릭터 삭제 API
  @Delete()
  public async deleteCharacter(@Params({ validate: true }) id: UserID, @Res() res: Response) {
    try {
      const user = await this.prisma.user.findOne({
        where: { userId: id.userId },
        select: {
          characters: true,
        },
      });
      if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      if (user.characters.length === 0) throw new NotFoundError('사용자의 캐릭터를 찾을 수 없습니다.'); // 1:1

      await this.prisma.character.delete({
        where: {
          characterId: user.characters[0].characterId,
        },
      });
      return res.status(200).send({ message: 'success' });
    } catch (err) {
      throw new InternalServerError(err);
    }
  }
}

//임시
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}
