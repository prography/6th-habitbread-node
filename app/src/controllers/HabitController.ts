import { Habit, PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import { Response } from 'express';
import moment from 'moment-timezone';
import { Body, CurrentUser, Delete, Get, HttpCode, HttpError, JsonController, Params, Post, Put, Res } from 'routing-controllers';
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError } from '../exceptions/Exception';
import RedisRepository from '../repository/RedisRepository';
import { HabitService } from '../services/HabitService';
import { errorService } from '../services/LogService';
import { Comments } from '../utils/CommentUtil';
import { LevelUtil } from '../utils/LevelUtil';
import { UserItemUtil } from '../utils/UserItemUtil';
import { CreateHabitRequestDto, GetHabitRequestDto, HabitID, UpdateHabitRequestDto } from '../validations/HabitValidation';
import { BaseController } from './BaseController';

@JsonController('/habits')
export class HabitController extends BaseController {
  private prisma: PrismaClient;
  private redis: RedisRepository;
  private habitService: HabitService;
  private comment: any;
  private levelUtil: any;
  private userItemUtil: any;

  constructor() {
    super();
    moment.tz.setDefault('Asia/Seoul');
    this.prisma = new PrismaClient();
    this.redis = RedisRepository.getInstance();
    this.habitService = new HabitService();
    this.comment = new Comments();
    this.levelUtil = LevelUtil.getInstance();
    this.userItemUtil = new UserItemUtil();
  }

  // 습관 등록하기
  @Post('/')
  @HttpCode(201)
  public async createHabit(@CurrentUser() currentUser: User, @Body() habitDto: CreateHabitRequestDto) {
    const bodyErrors = await validate(habitDto);
    if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);
    if (habitDto.dayOfWeek.length !== 7) throw new BadRequestError('요일이 올바르지 않습니다.');

    return await this.habitService.createHabit(currentUser, habitDto);
  }

  // 전체 습관 조회하기
  @Get('/')
  public async findHabits(@CurrentUser() currentUser: User) {
    const { habits, comment } = await this.habitService.findAllHabitWithComment(currentUser);

    if (habits.length === 0) return { comment, habits: [] };
    return { comment, habits };
  }

  // habitId로 습관 조회하기
  @Get('/:habitId/calendar/:year/:month')
  public async findHabit(@CurrentUser() currentUser: User, @Params() habitDto: GetHabitRequestDto) {
    const paramErrors = await validate(habitDto);
    if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

    const { habit, commitFullCount, lastMonth } = await this.habitService.findHabitWithCommitCount(currentUser, habitDto);
    return {
      habit,
      commitFullCount,
      comparedToLastMonth: habit.commitHistory.length - lastMonth,
    };
  }

  // habitId로 습관 수정하기
  @Put('/:habitId')
  @HttpCode(201)
  public async updateHabit(@CurrentUser() currentUser: User, @Params() id: HabitID, @Body() habitDto: UpdateHabitRequestDto) {
    const paramErrors = await validate(id);
    if (paramErrors.length > 0) throw new BadRequestError(paramErrors);
    const bodyErrors = await validate(habitDto);
    if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

    return this.habitService.updateHabit(currentUser, id, habitDto);
  }

  // habitId로 습관 삭제하기
  @Delete('/:habitId')
  public async deleteHabit(@CurrentUser() currentUser: User, @Params() id: HabitID) {
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
        await this.redis.srem(moment(findHabit.alarmTime, 'HH:mm').format('MMDDHHmm'), String(findHabit.habitId));

        return { message: 'success' };
      }
      throw new ForbiddenError('잘못된 접근입니다.');
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habit commit하기
  @Post('/:habitId/commit')
  @HttpCode(201)
  public async commitHabit(@CurrentUser() currentUser: User, @Params() id: HabitID, @Res() res: Response) {
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
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  async updateHabitFunc(currentUser: User, id: HabitID, continuousCount: number) {
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

  async addOrUpdateRedis(habit: Habit, user: User) {
    await this.redis.sadd(moment(habit.alarmTime, 'HH:mm').format('MMDDHHmm'), String(habit.habitId));
    await this.redis.hmset(`habitId:${habit.habitId}`, ['userId', user.userId, 'title', habit.title, 'dayOfWeek', habit.dayOfWeek]);
    await this.redis.expire(`habitId:${habit.habitId}`, 604860);
  }
}
