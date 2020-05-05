import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { Body, Delete, Get, HttpError, JsonController, Params, Post, Put, Res } from 'routing-controllers';
import { NoContent, NotFoundError } from '../exceptions/Exception';
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
  public async createHabit(
    @Params({ validate: true }) id: UserID,
    @Body({ validate: true }) habit: Habit,
    @Res() res: Response
  ) {
    try {
      const user = await this.prisma.user.findOne({
        where: { userId: id.userId },
      });

      if (user === null) {
        // 사용자가 없는 경우
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      }
      // 정상적인 쿼리인 경우
      const newHabit = await this.prisma.habit.create({
        data: {
          title: habit.title,
          description: habit.description,
          category: habit.category,
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
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }

  // 전체 습관 조회하기
  @Get('/')
  public async findHabits(@Params({ validate: true }) id: UserID, @Res() res: Response) {
    try {
      const user = await this.prisma.user.findOne({
        where: { userId: id.userId },
        select: {
          userId: true,
          Habit: true,
        },
      });
      if (user === null) {
        // 사용자가 없는 경우
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      } else if (user.Habit.length === 0) {
        // 사용자는 있지만 만든 습관이 없는 경우
        throw new NoContent('');
      } else {
        // 정상적인 쿼리인 경우
        return user;
      }
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }

  // habitId로 습관 조회하기
  @Get('/:habitId')
  public async findHabit(@Params({ validate: true }) id: ID, @Res() res: Response) {
    try {
      const habit = await this.prisma.user
        .findOne({
          where: { userId: id.userId },
        })
        .Habit({
          where: { habitId: id.habitId },
        });

      if (habit === null) {
        // 사용자가 없는 경우
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      } else if (habit.length === 0) {
        // 습관이 없는 경우
        throw new NotFoundError('습관을 찾을 수 없습니다.');
      } else {
        // 정상적인 쿼리인 경우
        return habit[0];
      }
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }

  // habitId로 습관 수정하기
  @Put('/:habitId')
  public async updateHabit(
    @Params({ validate: true }) id: ID,
    @Body({ validate: true }) habit: Habit,
    @Res() res: Response
  ) {
    try {
      const findHabit = await this.prisma.user
        .findOne({
          where: { userId: id.userId },
        })
        .Habit({
          where: { habitId: id.habitId },
        });

      if (findHabit === null) {
        // 사용자가 없는 경우
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      } else if (findHabit.length === 0) {
        // 습관이 없는 경우
        throw new NotFoundError('습관을 찾을 수 없습니다.');
      }
      // 정상적인 쿼리인 경우
      return await this.prisma.habit.update({
        where: { habitId: id.habitId },
        data: {
          title: habit.title,
          description: habit.description,
          category: habit.category,
          user: {
            connect: { userId: id.userId },
          },
        },
      });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }

  // habitId로 습관 삭제하기
  @Delete('/:habitId')
  public async deleteHabit(@Params({ validate: true }) id: ID, @Res() res: Response) {
    try {
      const findHabit = await this.prisma.user
        .findOne({
          where: { userId: id.userId },
        })
        .Habit({
          where: { habitId: id.habitId },
        });

      if (findHabit === null) {
        // 사용자가 없는 경우
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      } else if (findHabit.length === 0) {
        // 습관이 없는 경우
        throw new NotFoundError('습관을 찾을 수 없습니다.');
      }
      // 정상적인 쿼리인 경우
      await this.prisma.habit.delete({
        where: {
          habitId: id.habitId,
        },
      });

      return res.status(200).send({ message: 'success' });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }
}
