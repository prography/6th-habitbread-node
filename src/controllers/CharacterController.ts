import { PrismaClient } from '@prisma/client';
import { Body, BodyParam, Get, HttpError, JsonController, Param, Post } from 'routing-controllers';
import { Character } from '../validations/Character';
import { BaseController } from './BaseController';

@JsonController('/character')
export class CharacterController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 특정 사용자의 캐릭터 조회 API
  @Get('/:userId')
  public async index(@Param('userId') userId: number) {
    return await this.prisma.character.findOne({
      where: { userId },
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
  public async calculateExp(@BodyParam('userId') userId: number, @BodyParam('value') value: number) {
    const character = await this.prisma.character.findOne({
      where: { userId },
    });
    if (!character) throw new HttpError(404, '조회된 캐릭터가 없습니다.');

    const exp: number = character.exp + value;
    return await this.prisma.character.update({
      where: { userId: userId },
      data: {
        exp: exp,
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
