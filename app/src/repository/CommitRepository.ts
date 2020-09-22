import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import { BaseRepository } from './BaseRepository';

export class CommitRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    moment.tz.setDefault('Aisa/Seoul');
    this.prisma = new PrismaClient();
  }

  public async count(habitId: number) {
    return this.prisma.commitHistory.count({
      where: { habitId },
    });
  }

  public async countWithinLastMonth(habitId: number, year: number, month: number) {
    return this.prisma.commitHistory.count({
      where: {
        habitId,
        createdAt: {
          gte: moment()
            .subtract(month + 1, 'months')
            .subtract(year, 'years')
            .startOf('months')
            .toDate(),
          lte: moment()
            .subtract(month + 1, 'months')
            .subtract(year, 'years')
            .endOf('months')
            .toDate(),
        },
      },
    });
  }

  public async deleteManyByHabitId(habitId: number) {
    return this.prisma.commitHistory.deleteMany({ where: { habitId } });
  }
}
