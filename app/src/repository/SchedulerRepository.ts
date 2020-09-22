import { PrismaClient, SchedulerCreateInput } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class SchedulerRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  public async createScheduler(payload: SchedulerCreateInput) {
    return await this.prisma.scheduler.create({
      data: payload,
    });
  }
}
