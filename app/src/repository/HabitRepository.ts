import { HabitCreateInput, PrismaClient } from '@prisma/client';
import moment from 'moment';
import { BaseRepository } from './BaseRepository';

export class HabitRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    moment.tz.setDefault('Aisa/Seoul');
    this.prisma = new PrismaClient();
  }

  public async createHabitJoinUser(payload: HabitCreateInput) {
    return this.prisma.habit.create({
      data: payload,
    });
  }

  public async findAllHabitByUserIdWithinAWeek(userId: number) {
    return this.prisma.habit.findMany({
      where: { userId },
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
  }

  public async findHabitByIdWithinYearAndMonth(habitId: number, year: number, month: number) {
    return this.prisma.habit.findOne({
      where: { habitId },
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

  public async updateHabitByIdWithinYearAndMonth(habitId: number, year: number, month: number) {
    return this.prisma.habit.update({
      where: { habitId },
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
