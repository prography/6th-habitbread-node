import { PrismaClient } from '@prisma/client';
import { Body, Get, JsonController, Params, Post, Put } from 'routing-controllers';
import { AddHabit, Id, UpdateHabit, UserId } from '../validations/HabitValidation';
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
  public async createHabit(@Body({ validate: true }) habit: AddHabit) {
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
  public async findHabits(@Params({ validate: true }) id: UserId) {
    return await this.prisma.habit.findMany({
      where: { userId: id.userId },
    });
  }

  // habitId로 습관 조회하기
  @Get('/:userId/:habitId')
  public async findHabit(@Params({ validate: true }) id: Id) {
    return await this.prisma.user
      .findOne({
        where: { userId: id.userId },
      })
      .Habit({
        where: { habitId: id.habitId },
      });
  }

  // habitId로 습관 수정하기
  @Put('/:userId/:habitId')
  public async updateHabit(@Params({ validate: true }) id: Id, @Body({ validate: true }) habit: UpdateHabit) {
    return await this.prisma.habit.update({
      where: {
        userId: id.userId,
        habitId: id.habitId,
      },
      data: {
        title: habit.title,
        category: habit.category,
        description: habit.description,
      },
    });
  }
}
