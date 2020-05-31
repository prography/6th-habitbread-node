import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import moment from 'moment-timezone';
import { Body, CurrentUser, Delete, Get, HttpError, JsonController, Params, Post, Put } from 'routing-controllers';
import { BadRequestError, ForbiddenError, InternalServerError, NoContent, NotFoundError } from '../exceptions/Exception';
import { Habit, ID } from '../validations/HabitValidation';
import { BaseController } from './BaseController';

@JsonController('/habits')
export class HabitController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
    moment.tz.setDefault('Asia/Seoul');
  }

  // 습관 등록하기
  @Post('/')
  public async createHabit(@CurrentUser() currentUser: any, @Body() habit: Habit) {
    try {
      const bodyErrors = await validate(habit);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

      const user = await this.prisma.user.findOne({
        where: { userId: currentUser },
      });
      if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      const newHabit = await this.prisma.habit.create({
        data: {
          title: habit.title,
          category: habit.category,
          dayOfWeek: habit.dayOfWeek,
          alarmTime: moment(habit.alarmTime, 'YYYY-MM-DD HH:mm:ss').toDate(),
          continuousCount: 0,
          user: {
            connect: { userId: currentUser },
          },
        },
      });

      // 스케줄러 등록 부분(추가 수정 필요)
      if (habit.dayOfWeek === null) {
        return newHabit;
      }
      await this.prisma.scheduler.create({
        data: { userId: currentUser, habitId: newHabit.habitId },
      });
      return newHabit;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 전체 습관 조회하기
  @Get('/')
  public async findHabits(@CurrentUser() currentUser: any) {
    try {
      const user = await this.prisma.user.findOne({
        where: { userId: currentUser },
        select: {
          habits: true,
        },
      });
      if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      else if (user.habits.length === 0) throw new NoContent('');
      return user;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habitId로 습관 조회하기
  @Get('/:habitId')
  public async findHabit(@CurrentUser() currentUser: any, @Params() id: ID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const habit = await this.prisma.user
        .findOne({
          where: { userId: currentUser },
        })
        .habits({
          where: { habitId: id.habitId },
        });

      if (habit === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      else if (habit.length === 0) throw new NotFoundError('습관을 찾을 수 없습니다.');
      const test = {
        habit: habit[0],
        time: moment(),
      };
      return test;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habitId로 습관 수정하기
  @Put('/:habitId')
  public async updateHabit(@CurrentUser() currentUser: any, @Params() id: ID, @Body() habit: Habit) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);
      const bodyErrors = await validate(habit);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

      const findHabit = await this.prisma.user
        .findOne({
          where: { userId: currentUser },
        })
        .habits({
          where: { habitId: id.habitId },
        });

      if (findHabit === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      else if (findHabit.length === 0) throw new NotFoundError('습관을 찾을 수 없습니다.');
      return await this.prisma.habit.update({
        where: { habitId: id.habitId },
        data: {
          title: habit.title,
          category: habit.category,
          dayOfWeek: habit.dayOfWeek,
          alarmTime: moment(habit.alarmTime, 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
          continuousCount: 0,
          user: {
            connect: { userId: currentUser },
          },
        },
      });
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habitId로 습관 삭제하기
  @Delete('/:habitId')
  public async deleteHabit(@CurrentUser() currentUser: any, @Params() id: ID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const findHabit = await this.prisma.user
        .findOne({
          where: { userId: currentUser },
        })
        .habits({
          where: { habitId: id.habitId },
        });

      if (findHabit === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      else if (findHabit.length === 0) throw new NotFoundError('습관을 찾을 수 없습니다.');
      await this.prisma.habit.delete({
        where: {
          habitId: id.habitId,
        },
      });

      return { message: 'success' };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habit commit하기
  @Get('/:habitId/commit')
  public async commitHabit(@CurrentUser() currentUser: any, @Params() id: ID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const findHabit = await this.prisma.user
        .findOne({
          where: { userId: currentUser },
        })
        .habits({
          where: { habitId: id.habitId },
          include: {
            commitHistory: {
              where: {
                createdAt: {
                  gte: moment().add(-1, 'days').startOf('days').toDate(),
                  lte: moment().endOf('days').toDate(),
                },
              },
            },
          },
        });

      if (findHabit === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      else if (findHabit.length === 0) throw new NotFoundError('습관을 찾을 수 없습니다.');

      if (findHabit[0].commitHistory.length) {
        if (findHabit[0].commitHistory.length === 2) throw new ForbiddenError('오늘은 이미 commit 했습니다.');
        if (moment(findHabit[0].commitHistory[0].createdAt).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
          throw new ForbiddenError('오늘은 이미 commit 했습니다.');
        return await this.prisma.habit.update({
          where: { habitId: id.habitId },
          data: { commitHistory: { create: {} }, continuousCount: findHabit[0].continuousCount + 1 },
        });
      }
      return await this.prisma.habit.update({
        where: { habitId: id.habitId },
        data: { commitHistory: { create: {} }, continuousCount: 1 },
      });
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
