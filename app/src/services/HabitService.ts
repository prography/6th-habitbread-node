import { Habit, HabitCreateInput, SchedulerCreateInput, User } from '@prisma/client';
import moment from 'moment';
import { HttpError } from 'routing-controllers';
import { InternalServerError } from '../exceptions/Exception';
import { HabitRepository } from '../repository/HabitRepository';
import RedisRepository from '../repository/RedisRepository';
import { SchedulerRepository } from '../repository/SchedulerRepository';
import { CreateHabitRequestDto } from '../validations/HabitValidation';
import { BaseService } from './BaseService';
import { errorService } from './LogService';

export class HabitService extends BaseService {
  private habitRepository: HabitRepository;
  private schedulerRepository: SchedulerRepository;
  private redis: RedisRepository;

  constructor() {
    super();
    this.habitRepository = new HabitRepository();
    this.schedulerRepository = new SchedulerRepository();
    this.redis = RedisRepository.getInstance();
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

  // Redis 추가 or 업데이트 작업
  private async addOrUpdateRedis(habit: Habit, user: User) {
    await this.redis.sadd(moment(habit.alarmTime, 'HH:mm').format('MMDDHHmm'), String(habit.habitId));
    await this.redis.hmset(`habitId:${habit.habitId}`, ['userId', user.userId, 'title', habit.title, 'dayOfWeek', habit.dayOfWeek]);
    await this.redis.expire(`habitId:${habit.habitId}`, 604860);
  }
}
