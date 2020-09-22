import { HabitCreateInput, PrismaClient, User } from '@prisma/client';
import moment from 'moment';
import { BaseRepository } from './BaseRepository';

export class HabitRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  public async createHabitJoinUser(payload: HabitCreateInput) {
    return this.prisma.habit.create({
      data: payload,
    });
  }

  public async findAllHabitWithinAWeekByUserId(user: User) {
    return this.prisma.habit.findMany({
      where: { userId: user.userId },
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
}
