import { PrismaClient, User } from '@prisma/client';
import { Payload } from '../payloads/Payload';

export const createHabit = async (prisma: PrismaClient, currentUser: User) => {
  let habitId: number = 0;
  for (let i = 0; i < 3; i += 1) {
    const payload = Payload.habitOriginalPayloads[i];
    const newHabit = await prisma.habit.create({
      data: {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        dayOfWeek: payload.dayOfWeek,
        alarmTime: payload.alarmTime,
        user: {
          connect: { userId: currentUser.userId },
        },
      },
    });
    if (i == 0) habitId = newHabit.habitId;
  }
  return habitId;
};
