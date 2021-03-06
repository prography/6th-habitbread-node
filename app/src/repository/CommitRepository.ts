import { PrismaClient } from '@prisma/client';
import moment from 'moment-timezone';
import { BaseRepository } from './BaseRepository';

export class CommitRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    moment.tz.setDefault('Asia/Seoul');
    this.prisma = new PrismaClient();
  }

  public async disconnect(){
    await this.prisma.disconnect()
  }

  public async count(habitId: number) {
    return this.prisma.commitHistory.count({
      where: { habitId },
    });
  }

  // 지난 1달간 커밋 횟수
  public async countLastMonth(habitId: number){
    return this.prisma.commitHistory.count({
      where: {
        habitId,
        createdAt: {
          gte: moment().subtract(1, 'months').startOf('days').toDate(),
          lte: moment().endOf('days').toDate(),
        },
      },
    })
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

  public async deleteAllByHabitId(habitId: number) {
    return this.prisma.commitHistory.deleteMany({ where: { habitId } });
  }
}
