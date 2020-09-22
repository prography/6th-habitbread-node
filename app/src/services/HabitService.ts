import { Habit, HabitCreateInput, SchedulerCreateInput, User } from '@prisma/client';
import moment from 'moment';
import { HttpError } from 'routing-controllers';
import { ForbiddenError, InternalServerError, NotFoundError } from '../exceptions/Exception';
import { CommitRepository } from '../repository/CommitRepository';
import { HabitRepository } from '../repository/HabitRepository';
import RedisRepository from '../repository/RedisRepository';
import { SchedulerRepository } from '../repository/SchedulerRepository';
import { Comments } from '../utils/CommentUtil';
import { CreateHabitRequestDto, GetHabitRequestDto } from '../validations/HabitValidation';
import { BaseService } from './BaseService';
import { errorService } from './LogService';

export class HabitService extends BaseService {
  private habitRepository: HabitRepository;
  private schedulerRepository: SchedulerRepository;
  private commitRepository: CommitRepository;
  private redis: RedisRepository;
  private comment: any;

  constructor() {
    super();
    moment.tz.setDefault('Aisa/Seoul');
    this.habitRepository = new HabitRepository();
    this.schedulerRepository = new SchedulerRepository();
    this.commitRepository = new CommitRepository();
    this.redis = RedisRepository.getInstance();
    this.comment = new Comments();
  }

  // 습관 생성
  public async createHabit(user: User, habitDto: CreateHabitRequestDto) {
    try {
      const habitPayload: HabitCreateInput = habitDto.toEntity(user, habitDto);
      const newHabit = await this.habitRepository.createHabitJoinUser(habitPayload);

      // 스케줄러 등록 부분(추가 수정 필요)
      if (habitPayload.alarmTime === null) return newHabit;

      const schedulerPayload: SchedulerCreateInput = {
        userId: user.userId,
        habitId: newHabit.habitId,
      };
      await this.schedulerRepository.createScheduler(schedulerPayload);

      if (newHabit.dayOfWeek[moment().day()] === '1') {
        const time = moment().startOf('minutes');
        const alarmTime = moment(newHabit.alarmTime, 'HH:mm');
        if (time.isBefore(alarmTime)) await this.addOrUpdateRedis(newHabit, user);
      }

      return newHabit;
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 일주일 이내 커밋했던 모든 습관 가져오기
  public async findAllHabitWithComment(user: User) {
    try {
      const habits = await this.habitRepository.findAllHabitByUserIdWithinAWeek(user.userId);
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

      return { habits, comment };
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // habitId로 특정 습관 조회하기
  public async findHabitWithCommitCount(user: User, habitDto: GetHabitRequestDto) {
    try {
      const year = parseInt(moment().format('YYYY')) - habitDto.year;
      const month = parseInt(moment().format('MM')) - habitDto.month;

      let habit = await this.habitRepository.findHabitByIdWithinYearAndMonth(habitDto.habitId, year, month);
      if (habit === null) throw new NotFoundError('습관을 찾을 수 없습니다.');

      if (habit.userId === user.userId) {
        if (habit.commitHistory.length) {
          if (
            moment(habit.commitHistory[habit.commitHistory.length - 1].createdAt, 'yyyy-MM-DDTHH-mm-ss.SSSZ').startOf('days') <
            moment().subtract(1, 'days').startOf('days')
          ) {
            habit = await this.habitRepository.updateHabitByIdWithinYearAndMonth(habitDto.habitId, year, month);
          }
        }
        const commitFullCount = await this.commitRepository.count(habit.habitId);

        const lastMonth = await this.commitRepository.countWithinLastMonth(habit.habitId, year, month);

        return {
          habit,
          commitFullCount,
          lastMonth,
        };
      }
      throw new ForbiddenError('잘못된 접근입니다.');
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // Redis 추가 or 업데이트 작업
  private async addOrUpdateRedis(habit: Habit, user: User) {
    await this.redis.sadd(moment(habit.alarmTime, 'HH:mm').format('MMDDHHmm'), String(habit.habitId));
    await this.redis.hmset(`habitId:${habit.habitId}`, ['userId', user.userId, 'title', habit.title, 'dayOfWeek', habit.dayOfWeek]);
    await this.redis.expire(`habitId:${habit.habitId}`, 604860);
  }
}
