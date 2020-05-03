import { PrismaClient } from '@prisma/client';
import { Body, Delete, Get, HttpError, JsonController, Params, Post } from 'routing-controllers';
import { Calculate, Character, CharacterID } from '../validations/CharacterValidation';
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
  public async index() {
    return await this.prisma.character.findMany();
  }

  // 특정 사용자의 캐릭터 조회 API
  @Get('/:userId')
  public async findCharacter(@Params({ validate: true }) id: UserID) {
    return await this.prisma.character.findOne({
      where: { userId: id.userId },
    });
  }

  // 캐릭터 생성 API
  @Post()
  public async createCharacter(@Body({ validate: true }) character: Character) {
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
  }

  // 캐릭터 경험치 계산 API
  @Post('/calculate')
  public async calculateExp(@Body({ validate: true }) calculate: Calculate) {
    const character = await this.prisma.character.findOne({
      where: { userId: calculate.userId },
    });
    if (!character) throw new HttpError(404, '조회된 캐릭터가 없습니다.');

    const exp: number = character.exp + calculate.value;
    return await this.prisma.character.update({
      where: { userId: calculate.userId },
      data: {
        exp,
      },
    });
  }

  // 특정 캐릭터 삭제 API
  @Delete()
  public async deleteCharacter(@Body({ validate: true }) id: CharacterID) {
    return await this.prisma.character.delete({
      where: {
        characterId: id.characterId,
      },
    });
  }
}

//임시
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}
