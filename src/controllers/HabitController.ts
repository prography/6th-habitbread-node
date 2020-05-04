import { PrismaClient } from '@prisma/client';
import { Body, Get, HttpError, JsonController, Params, Post, Put } from 'routing-controllers';
import { Habit, ID } from '../validations/HabitValidation';
import { UserID } from '../validations/UserValidation';
import { BaseController } from './BaseController';

@JsonController('/users/:userId/habits')
export class UserController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 습관 등록하기
  @Post('/')
  public async createHabit(@Params({ validate: true }) id: UserID, @Body({ validate: true }) habit: Habit) {
    try {
      const newHabit = await this.prisma.habit.create({
        data: {
          title: habit.title,
          category: habit.category,
          description: habit.description,
          user: {
            connect: { userId: id.userId },
          },
        },
      });

      if (habit.isScheduled === true) {
        // 추후 스케줄 작업 필요
      } else {
        // 추후 스케줄 작업 필요
      }

      return newHabit;
    } catch (err) {
      throw new HttpError(500, err);
    }
  }

  // 전체 습관 조회하기
  @Get('/')
  public async findHabits(@Params({ validate: true }) id: UserID) {
    let user;
    try {
      user = await this.prisma.user
        .findOne({
          where: { userId: id.userId },
        })
        .Habit();
    } catch (err) {
      console.log(err);
      throw new HttpError(500, err);
    }
    if (user.length === 0) {
      throw new HttpError(404, `${id.userId}는 없는 사용자입니다.`);
    }

    return user;
  }

  // habitId로 습관 조회하기
  @Get('/:habitId')
  public async findHabit(@Params({ validate: true }) id: ID) {
    return await this.prisma.user
      .findOne({
        where: { userId: id.userId },
      })
      .Habit({
        where: { habitId: id.habitId },
      });
  }

  // habitId로 습관 수정하기
  @Put('/:habitId')
  public async updateHabit(@Params({ validate: true }) id: ID, @Body({ validate: true }) habit: Habit) {
    await this.prisma.user.update({
      where: {
        userId: id.userId,
      },
      data: {
        Habit: {
          update: [
            {
              data: {
                title: habit.title,
                category: habit.category,
                description: habit.description,
              },
              where: { habitId: id.habitId },
            },
          ],
        },
      },
    });

    return await this.prisma.user
      .findOne({
        where: { userId: id.userId },
      })
      .Habit({
        where: { habitId: id.habitId },
      });
  }

  // @Delete('/')
}
