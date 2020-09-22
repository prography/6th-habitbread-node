import { PrismaClient, SchedulerCreateInput } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class SchedulerRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  public async create(payload: SchedulerCreateInput) {
    return await this.prisma.scheduler.create({
      data: payload,
    });
  }

  public async deleteByHabitId(habitId: number) {
    return this.prisma.scheduler.delete({
      where: { habitId },
    });
  }

  public async upsert(userId: number, updateId: number, createId: number) {
    return this.prisma.scheduler.upsert({
      where: { habitId: updateId },
      create: { userId, habitId: createId },
      update: {},
    });
  }

  public async deleteAllByHabitId(habitId: number) {
    return this.prisma.scheduler.deleteMany({ where: { habitId } });
  }
}
