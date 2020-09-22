import { HabitCreateInput, PrismaClient } from '@prisma/client';
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
}
