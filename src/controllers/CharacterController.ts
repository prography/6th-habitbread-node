import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
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
  public async findCharacter(@Params() id: UserID, @Res() res: Response) {
    try {
      const errors = await validate(id);
      if (errors.length > 0) throw new BadRequestError(errors);

      const character = await this.prisma.character.findOne({
        where: { userId: id.userId },
      });
      if (character === null) throw new NotFoundError('캐릭터를 찾을 수 없습니다.');
      return character;
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new InternalServerError(err.message);
    }
  }

  // 캐릭터 생성 API
  @Post()
  @HttpCode(201)
  public async createCharacter(@Params() id: UserID, @Res() res: Response) {
    try {
      const errors = await validate(id);
      if (errors.length > 0) throw new BadRequestError(errors);

      const user = await this.prisma.user.findOne({
        where: { userId: id.userId },
        select: {
          characters: true,
        },
      });
      if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      if (user.characters.length !== 0) throw new BadRequestError('이미 캐릭터를 가지고 있습니다.');

      return await this.prisma.character.create({
        data: {
          characterId: getRandomInt(1, 100000),
          exp: 0,
          users: {
            connect: { userId: id.userId },
          },
        },
      });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new InternalServerError(err.message);
    }
  }

  // 캐릭터 경험치 계산 API
  @Patch('/calculate')
  public async calculateExp(@Params() id: UserID, @Body() calculate: CalculateCharacter, @Res() res: Response) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const bodyErrors = await validate(calculate);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

      const user = await this.prisma.user.findOne({
        where: { userId: id.userId },
        select: {
          characters: true,
        },
      });
      if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      if (user.characters.length === 0) throw new NotFoundError('사용자의 캐릭터를 찾을 수 없습니다.');

      const exp: number = user.characters[0].exp + calculate.value;
      return await this.prisma.character.update({
        where: { userId: id.userId },
        data: {
          exp,
        },
      });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new InternalServerError(err.message);
    }
  }

  // 특정 캐릭터 삭제 API
  @Delete()
  public async deleteCharacter(@Params() id: UserID, @Res() res: Response) {
    try {
      const errors = await validate(id);
      if (errors.length > 0) throw new BadRequestError(errors);

      const user = await this.prisma.user.findOne({
        where: { userId: id.userId },
        select: {
          characters: true,
        },
      });
      if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      if (user.characters.length === 0) throw new NotFoundError('사용자의 캐릭터를 찾을 수 없습니다.');

      await this.prisma.character.delete({
        where: {
          characterId: user.characters[0].characterId,
        },
      });
      return res.status(200).send({ message: 'success' });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new InternalServerError(err.message);
    }
  }
}

//임시
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
