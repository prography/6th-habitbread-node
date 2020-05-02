import { PrismaClient } from '@prisma/client';
import { Body, Get, JsonController, Param, Post } from 'routing-controllers';
import { Habit } from '../validations/Habit';
import { BaseController } from './BaseController';

@JsonController('/habits')
export class UserController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 습관 등록하기
  @Post('/')
  public async createHabit(@Body({ validate: true }) habit: Habit) {
    return await this.prisma.habit.create({
      data: {
        title: habit.title,
        category: habit.category,
        description: habit.description,
        user: {
          connect: { userId: habit.userId },
        },
      },
    });
  }

  // 전체 습관 조회하기
  @Get('/:userId')
  public async findHabits(@Param('userId') userId: number) {
    return await this.prisma.habit.findMany({
      where: { userId },
    });
  }

  // habitId로 습관 조회하기
  @Get('/:userId/:habitId')
  public async findOneHabit(
    @Param('userId') userId: number,
    @Param('habitId') habitId: number
  ) {
    return await this.prisma.user
      .findOne({
        where: { userId },
      })
      .Habit({
        where: { habitId },
      });
  }
}
