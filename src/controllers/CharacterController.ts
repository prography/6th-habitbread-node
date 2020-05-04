import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { Body, Delete, Get, HttpCode, HttpError, JsonController, Params, Post, Put, Res } from 'routing-controllers';
import { BadRequestError, NoContent, NotFoundError } from '../exceptions/Exception';
import { AddCharacter, CalculateCharacter, CharacterID } from '../validations/CharacterValidation';
import { UserID } from '../validations/UserValidation';
import { BaseController } from './BaseController';

@JsonController('/characters')
export class CharacterController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 모든 캐릭터 조회 API
  @Get()
  public async index(@Res() res: Response) {
    try {
      // 이런식으로 명시 해주어야 하나?
      // const character: Character[] = await this.prisma.character.findMany();
      const characters = await this.prisma.character.findMany();
      if (characters.length === 0) throw new NoContent('검색된 결과가 없습니다.');
      return characters;
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err); // 204는 빈 값
      return res.status(500).send(err);
    }
  }

  // 특정 사용자의 캐릭터 조회 API
  @Get('/:userId')
  public async findCharacter(@Params({ validate: true }) id: UserID, @Res() res: Response) {
    try {
      const character = await this.prisma.character.findOne({
        where: { userId: id.userId },
      });
      if (!character) throw new NotFoundError('요청한 사용자의 캐릭터를 찾을 수 없습니다.');
      return character;
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      return res.status(500).send(err);
    }
  }

  // 캐릭터 생성 API
  @Post()
  @HttpCode(201)
  public async createCharacter(@Body({ validate: true }) character: AddCharacter, @Res() res: Response) {
    try {
      const res = await this.prisma.character.findOne({
        where: { userId: character.userId },
      });
      if (res) throw new BadRequestError('해당 유저는 이미 캐릭터를 가지고 있습니다.');

      return await this.prisma.character.create({
        data: {
          // @default(autoincrement()) 해야함
          characterId: getRandomInt(1, 100000),
          exp: character.exp,
          // user로 변경해야함
          users: {
            connect: { userId: character.userId },
          },
        },
      });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      res.status(500).send(err);
    }
  }

  // 캐릭터 경험치 계산 API
  @Put('/calculate')
  public async calculateExp(@Body({ validate: true }) calculate: CalculateCharacter, @Res() res: Response) {
    try {
      const character = await this.prisma.character.findOne({
        where: { userId: calculate.userId },
      });
      if (!character) throw new NotFoundError('요청한 사용자의 캐릭터를 찾을 수 없습니다.');

      const exp: number = character.exp + calculate.value;
      return await this.prisma.character.update({
        where: { userId: calculate.userId },
        data: {
          exp,
        },
      });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      return res.status(500).send(err);
    }
  }

  // 특정 캐릭터 삭제 API
  @Delete()
  public async deleteCharacter(@Body({ validate: true }) id: CharacterID, @Res() res: Response) {
    try {
      return await this.prisma.character.delete({
        where: {
          characterId: id.characterId,
        },
      });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      return res.status(500).send(err);
    }
  }
}

//임시
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}
