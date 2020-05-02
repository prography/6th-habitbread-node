import { PrismaClient } from '@prisma/client';
import { Body, JsonController, Post } from 'routing-controllers';
import { Habit } from '../validations/Habit';
import { BaseController } from './BaseController';

@JsonController('/habits')
export class UserController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  @Post('/')
  public async findHabits(@Body({ validate: true }) habit: Habit) {
    return await this.prisma.habit.create({
      data: {
        title: habit.title,
        category: habit.category,
        description: habit.description,
        user: {
          connect: { userId: habit.userId },
        },
      },
    });
  }
}
