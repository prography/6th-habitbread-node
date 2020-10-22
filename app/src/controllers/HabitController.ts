import { Habit, PrismaClient, User } from '@prisma/client';
import { validate } from 'class-validator';
import { Response } from 'express';
import moment from 'moment-timezone';
import { Body, CurrentUser, Delete, Get, HttpCode, JsonController, Params, Post, Put, Res } from 'routing-controllers';
import { BadRequestError } from '../exceptions/Exception';
import RedisRepository from '../repository/RedisRepository';
import { HabitService } from '../services/HabitService';
import { CreateHabitRequestDto, GetHabitRequestDto, HabitID, UpdateHabitRequestDto } from '../validations/HabitValidation';
import { BaseController } from './BaseController';

@JsonController('/habits')
export class HabitController extends BaseController {
  private redis: RedisRepository;
  private habitService: HabitService;

  constructor() {
    super();
    moment.tz.setDefault('Asia/Seoul');
    this.redis = new RedisRepository();
    this.habitService = new HabitService();
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
    const paramErrors = await validate(id);
    if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

    await this.habitService.deleteHabit(currentUser, id);
    return { message: 'success' };
  }

  // habit commit하기
  @Post('/:habitId/commit')
  @HttpCode(201)
  public async commitHabit(@CurrentUser() currentUser: User, @Params() id: HabitID, @Res() res: Response) {
    const paramErrors = await validate(id);
    if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

    return this.habitService.commitHabit(currentUser, id, res);
  }

  async addOrUpdateRedis(habit: Habit, user: User) {
    await this.redis.sadd(moment(habit.alarmTime, 'HH:mm').format('MMDDHHmm'), String(habit.habitId));
    await this.redis.hmset(`habitId:${habit.habitId}`, ['userId', user.userId, 'title', habit.title, 'dayOfWeek', habit.dayOfWeek]);
    await this.redis.expire(`habitId:${habit.habitId}`, 604860);
  }
}
