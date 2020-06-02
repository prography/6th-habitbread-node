import { PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import moment from 'moment-timezone';
import { Body, CurrentUser, Delete, Get, HttpError, JsonController, Params, Post, Put } from 'routing-controllers';
import { BadRequestError, ForbiddenError, InternalServerError, NoContent, NotFoundError } from '../exceptions/Exception';
import { GetHabit, Habit, ID, UpdateHabit } from '../validations/HabitValidation';
import { BaseController } from './BaseController';

@JsonController('/habits')
export class HabitController extends BaseController {
  private prisma: PrismaClient;
  public dayOfTheWeek = new Map();

  constructor() {
    super();
    this.prisma = new PrismaClient();
    moment.tz.setDefault('Asia/Seoul');
    this.dayOfTheWeek.set('Mon', 0);
    this.dayOfTheWeek.set('Tue', 1);
    this.dayOfTheWeek.set('Wed', 2);
    this.dayOfTheWeek.set('Thu', 3);
    this.dayOfTheWeek.set('Fri', 4);
    this.dayOfTheWeek.set('Sat', 5);
    this.dayOfTheWeek.set('Sun', 6);
  }

  // 습관 등록하기
  @Post('/')
  public async createHabit(@CurrentUser() currentUser: User, @Body() habit: Habit) {
    try {
      const bodyErrors = await validate(habit);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);
      if (habit.dayOfWeek.length !== 7) throw new BadRequestError('요일이 올바르지 않습니다.');
      const alarmTime = habit.alarmTime ? moment(habit.alarmTime, 'HH:mm:ss').format('HH:mm:ss') : null;
      const newHabit = await this.prisma.habit.create({
        data: {
          title: habit.title,
          category: habit.category,
          dayOfWeek: habit.dayOfWeek,
          alarmTime,
          user: {
            connect: { userId: currentUser.userId },
          },
        },
      });

      // 스케줄러 등록 부분(추가 수정 필요)
      if (alarmTime === null) {
        return newHabit;
      }
      await this.prisma.scheduler.create({
        data: { userId: currentUser.userId, habitId: newHabit.habitId },
      });
      return newHabit;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 전체 습관 조회하기
  @Get('/')
  public async findHabits(@CurrentUser() currentUser: User) {
    try {
      const habits = await this.prisma.habit.findMany({
        where: { userId: currentUser.userId },
        select: {
          habitId: true,
          title: true,
          dayOfWeek: true,
          commitHistory: {
            where: {
              createdAt: {
                gte: moment().add(-30, 'days').startOf('days').toDate(),
                lte: moment().endOf('days').toDate(),
              },
            },
          },
        },
      });
      if (habits.length === 0) throw new NoContent('');

      const customizeHabits: { habitId: number; title: string; persent: number }[] = [];
      habits.forEach(habit => {
        let dayCount = 0,
          stack = 30;
        for (let i = this.dayOfTheWeek.get(moment().format('ddd')); i >= 0; --i) {
          if (habit.dayOfWeek[i] === '1') dayCount++;
          stack--;
        }
        let dayCheck = 0;
        for (let i = 0; i < 7; ++i) if (habit.dayOfWeek[i] === '1') dayCheck++;
        dayCount += (stack / 7) * dayCheck;
        for (let i = 7 - (stack % 7); i < 7; ++i) if (habit.dayOfWeek[i] === '1') dayCount++;

        customizeHabits.push({
          habitId: habit.habitId,
          title: habit.title,
          persent: Math.round((habit.commitHistory.length * 100) / dayCount),
        });
      });

      return { habits: customizeHabits };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habitId로 습관 조회하기
  @Get('/:habitId/calender/:year/:month')
  public async findHabit(@CurrentUser() currentUser: User, @Params() id: GetHabit) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);
      if (id.month > 12 || id.month < 1) throw new BadRequestError('month가 잘못됐습니다.');
      const findHabit = await this.prisma.habit.findOne({
        where: { habitId: id.habitId },
        include: {
          commitHistory: {
            where: {
              createdAt: {
                gte: moment()
                  .add(-(parseInt(moment().format('MM')) - id.month), 'months')
                  .add(-(parseInt(moment().format('YYYY')) - id.year), 'years')
                  .startOf('months')
                  .toDate(),
                lte: moment()
                  .add(-(parseInt(moment().format('MM')) - id.month), 'months')
                  .add(-(parseInt(moment().format('YYYY')) - id.year), 'years')
                  .add()
                  .endOf('months')
                  .toDate(),
              },
            },
          },
        },
      });
      if (findHabit === null) throw new NotFoundError('습관을 찾을 수 없습니다.');
      if (findHabit.userId === currentUser.userId) {
        const commitFullCount = await this.prisma.commitHistory.count({
          where: { habitId: id.habitId },
        });
        return {
          habit: findHabit,
          commitFullCount,
        };
      }
      throw new ForbiddenError('잘못된 접근입니다.');
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habitId로 습관 수정하기
  @Put('/:habitId')
  public async updateHabit(@CurrentUser() currentUser: User, @Params() id: ID, @Body() habit: UpdateHabit) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);
      const bodyErrors = await validate(habit);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

      const findHabit = await this.prisma.habit.findOne({
        where: { habitId: id.habitId },
      });
      if (findHabit === null) throw new NotFoundError('습관을 찾을 수 없습니다.');
      if (findHabit.userId === currentUser.userId) {
        const alarmTime = habit.alarmTime ? moment(habit.alarmTime, 'HH:mm:ss').format('HH:mm:ss') : null;
        const fixHabit = await this.prisma.habit.update({
          where: { habitId: id.habitId },
          data: {
            alarmTime,
            user: {
              connect: { userId: currentUser.userId },
            },
          },
        });
        // 스케줄러 등록 부분(추가 수정 필요)
        if (alarmTime === null) {
          if (findHabit.alarmTime) {
            await this.prisma.scheduler.delete({
              where: { habitId: fixHabit.habitId },
            });
          }
          return fixHabit;
        }
        await this.prisma.scheduler.upsert({
          where: { habitId: fixHabit.habitId },
          create: { userId: currentUser.userId, habitId: findHabit.habitId },
          update: {},
        });
        return fixHabit;
      }
      throw new ForbiddenError('잘못된 접근입니다.');
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habitId로 습관 삭제하기
  @Delete('/:habitId')
  public async deleteHabit(@CurrentUser() currentUser: User, @Params() id: ID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const findHabit = await this.prisma.habit.findOne({
        where: { habitId: id.habitId },
      });
      if (findHabit === null) throw new NotFoundError('습관을 찾을 수 없습니다.');
      if (findHabit.userId === currentUser.userId) {
        await this.prisma.commitHistory.deleteMany({ where: { habitId: id.habitId } });
        await this.prisma.scheduler.deleteMany({ where: { habitId: id.habitId } });
        await this.prisma.habit.delete({ where: { habitId: id.habitId } });
        return { message: 'success' };
      }
      throw new ForbiddenError('잘못된 접근입니다.');
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habit commit하기
  @Get('/:habitId/commit')
  public async commitHabit(@CurrentUser() currentUser: User, @Params() id: ID) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const findHabitForDay = await this.prisma.habit.findOne({
        where: { habitId: id.habitId },
      });

      if (findHabitForDay === null) throw new NotFoundError('습관을 찾을 수 없습니다.');

      let check = 0;
      for (let i = 7; i !== 0; --i) {
        check++;
        if (findHabitForDay.dayOfWeek[i] === '1') break;
      }
      const findHabit = await this.prisma.habit.findOne({
        where: { habitId: id.habitId },
        include: {
          commitHistory: {
            where: {
              createdAt: {
                gte: moment().add(-check, 'days').startOf('days').toDate(),
                lte: moment().endOf('days').toDate(),
              },
            },
          },
        },
      });

      if (findHabit === null) throw new NotFoundError('습관을 찾을 수 없습니다.');
      if (findHabit.userId === currentUser.userId) {
        if (findHabit.commitHistory.length) {
          console.log(findHabit.commitHistory.length);
          if (findHabit.commitHistory.length === 2) throw new ForbiddenError('오늘은 이미 commit 했습니다.');
          if (moment(findHabit.commitHistory[0].createdAt).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
            throw new ForbiddenError('오늘은 이미 commit 했습니다.');
          return await this.prisma.habit.update({
            where: { habitId: id.habitId },
            data: { commitHistory: { create: {} }, continuousCount: findHabit.continuousCount + 1 },
          });
        }
        return await this.prisma.habit.update({
          where: { habitId: id.habitId },
          data: { commitHistory: { create: {} }, continuousCount: 1 },
        });
      }
      throw new ForbiddenError('잘못된 접근입니다.');
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
