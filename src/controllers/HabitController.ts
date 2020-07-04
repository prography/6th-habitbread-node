import { PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import { Response } from 'express';
import moment from 'moment-timezone';
import { Body, CurrentUser, Delete, Get, HttpCode, HttpError, JsonController, Params, Post, Put, Res } from 'routing-controllers';
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError } from '../exceptions/Exception';
import alarmScheduler from '../schedulers/AlarmScheduler';
import { Comments } from '../utils/CommentUtil';
import { LevelUtil } from '../utils/LevelUtil';
import { UserItemUtil } from '../utils/UserItemUtil';
import { GetHabit, Habit, ID, UpdateHabit } from '../validations/HabitValidation';
import { BaseController } from './BaseController';

@JsonController('/habits')
export class HabitController extends BaseController {
  private prisma: PrismaClient;
  private comment: any;
  private levelUtil: any;
  private userItemUtil: any;

  constructor() {
    super();
    this.comment = new Comments();
    this.levelUtil = LevelUtil.getInstance();
    this.userItemUtil = new UserItemUtil();
    this.prisma = new PrismaClient();
    moment.tz.setDefault('Asia/Seoul');
  }

  // 습관 등록하기
  @Post('/')
  @HttpCode(201)
  public async createHabit(@CurrentUser() currentUser: User, @Body() habit: Habit) {
    try {
      const bodyErrors = await validate(habit);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);
      if (habit.dayOfWeek.length !== 7) throw new BadRequestError('요일이 올바르지 않습니다.');
      const alarmTime = habit.alarmTime ? moment(habit.alarmTime, 'HH:mm:ss').format('HH:mm:ss') : null;
      const newHabit = await this.prisma.habit.create({
        data: {
          title: habit.title,
          description: habit.description,
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
      if (newHabit.dayOfWeek[moment().day()] === '1') {
        const time = moment().startOf('minutes');
        const alarmTime = moment(newHabit.alarmTime, 'HH:mm');
        if (time.isBefore(alarmTime)) alarmScheduler.AddDataInToQueue(currentUser, newHabit);
      }
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
          description: true,
          dayOfWeek: true,
          commitHistory: {
            where: {
              createdAt: {
                gte: moment().startOf('weeks').toDate(),
                lte: moment().endOf('weeks').toDate(),
              },
            },
            select: { createdAt: true },
          },
        },
      });
      // 응원 문구
      let todayDoneHabit = 0;
      let todayHabit = 0;
      habits.forEach(habit => {
        if (habit.dayOfWeek[moment().day()] === '1') {
          if (habit.commitHistory.length) {
            if (moment(habit.commitHistory[habit.commitHistory.length - 1].createdAt).format('yyyy-MM-DD') === moment().format('yyyy-MM-DD'))
              todayDoneHabit++;
          }
          todayHabit++;
        }
      });
      const comment = this.comment.selectComment(todayHabit, todayDoneHabit);
      if (habits.length === 0) return { comment, habits: [] };
      return { comment, habits };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habitId로 습관 조회하기
  @Get('/:habitId/calendar/:year/:month')
  public async findHabit(@CurrentUser() currentUser: User, @Params() id: GetHabit) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);
      const month = parseInt(moment().format('MM')) - id.month;
      const year = parseInt(moment().format('YYYY')) - id.year;
      let findHabit = await this.prisma.habit.findOne({
        where: { habitId: id.habitId },
        include: {
          commitHistory: {
            where: {
              createdAt: {
                gte: moment().subtract(month, 'months').subtract(year, 'years').startOf('months').toDate(),
                lte: moment().subtract(month, 'months').subtract(year, 'years').endOf('months').toDate(),
              },
            },
            select: { createdAt: true },
          },
        },
      });
      if (findHabit === null) throw new NotFoundError('습관을 찾을 수 없습니다.');
      if (findHabit.userId === currentUser.userId) {
        if (findHabit.commitHistory.length) {
          if (
            moment(findHabit.commitHistory[findHabit.commitHistory.length - 1].createdAt, 'yyyy-MM-DDTHH-mm-ss.SSSZ').startOf('days') <
            moment().subtract(1, 'days').startOf('days')
          ) {
            findHabit = await this.prisma.habit.update({
              where: { habitId: id.habitId },
              data: { continuousCount: 0 },
              include: {
                commitHistory: {
                  where: {
                    createdAt: {
                      gte: moment().subtract(month, 'months').subtract(year, 'years').startOf('months').toDate(),
                      lte: moment().subtract(month, 'months').subtract(year, 'years').endOf('months').toDate(),
                    },
                  },
                  select: { createdAt: true },
                },
              },
            });
          }
        }
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
  @HttpCode(201)
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
            title: habit.title,
            description: habit.description,
            category: habit.category,
            alarmTime,
            user: {
              connect: { userId: currentUser.userId },
            },
          },
        });

        // 스케줄러 편집
        if (fixHabit.dayOfWeek[moment().day()] === '1') alarmScheduler.DeleteDataFromQueue(fixHabit);
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
        if (fixHabit.dayOfWeek[moment().day()] === '1') {
          const time = moment().startOf('minutes');
          const alarmTime = moment(fixHabit.alarmTime, 'HH:mm');
          if (time.isBefore(alarmTime)) alarmScheduler.AddDataInToQueue(currentUser, fixHabit);
        }
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
  @Post('/:habitId/commit')
  @HttpCode(201)
  public async commitHabit(@CurrentUser() currentUser: User, @Params() id: ID, @Res() res: Response) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

      const findHabitForDay = await this.prisma.habit.findOne({
        where: { habitId: id.habitId },
      });

      if (findHabitForDay === null) throw new NotFoundError('습관을 찾을 수 없습니다.');

      let check = 0;
      const todayOfTheWeek = moment().day();
      for (let i = todayOfTheWeek + 6; i !== todayOfTheWeek; --i) {
        check++;
        if (i > 6) {
          if (findHabitForDay.dayOfWeek[i - 7] === '1') break;
        } else {
          if (findHabitForDay.dayOfWeek[i] === '1') break;
        }
      }
      const findHabit = await this.prisma.habit.findOne({
        where: { habitId: id.habitId },
        include: {
          commitHistory: {
            where: {
              createdAt: {
                gte: moment().subtract(check, 'days').startOf('days').toDate(),
                lte: moment().endOf('days').toDate(),
              },
            },
          },
        },
      });

      let updateHabit;
      if (findHabit === null) throw new NotFoundError('습관을 찾을 수 없습니다.');
      if (findHabit.userId === currentUser.userId) {
        if (findHabit.commitHistory.length) {
          if (moment(findHabit.commitHistory[findHabit.commitHistory.length - 1].createdAt).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
            return res.status(303).send({});
          updateHabit = await this.updateHabitFunc(currentUser, id, findHabit.continuousCount + 1);
        } else updateHabit = await this.updateHabitFunc(currentUser, id, 1);

        const isEqual = this.levelUtil.compareLevels(currentUser.exp, updateHabit.user.exp);
        if (!isEqual) return this.userItemUtil.createItem(this.prisma, currentUser);
        return {};
      }
      throw new ForbiddenError('잘못된 접근입니다.');
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  async updateHabitFunc(currentUser: User, id: ID, continuousCount: number) {
    return await this.prisma.habit.update({
      where: { habitId: id.habitId },
      data: {
        commitHistory: { create: {} },
        continuousCount,
        user: {
          update: { exp: currentUser.exp + 5 },
        },
      },
      select: {
        user: true,
      },
    });
  }
}
