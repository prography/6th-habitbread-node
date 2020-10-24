import { PrismaClient } from '@prisma/client';
import moment from 'moment-timezone';
import { HabitIncludeUser } from '../@types/Types';
import { InternalServerError } from '../exceptions/Exception';
import RedisRepository from '../repository/RedisRepository';
moment.tz.setDefault('Asia/Seoul');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const prisma = new PrismaClient();
const redis = new RedisRepository();

const habitCheckWithUser = (habit: HabitIncludeUser | null) => {
  if (habit === null) return true;
  if (habit.dayOfWeek[moment().day()] === '0') return true;
  return false;
};

const AddSchedule = async (schedule: any) => {
  try {
    const habit = await prisma.habit.findOne({
      where: { habitId: schedule.habitId },
      select: { user: true, habitId: true, alarmTime: true, title: true, dayOfWeek: true },
    });
    if (habitCheckWithUser(habit)) return;
    if (moment(habit!.alarmTime, 'HH:mm').isBefore(moment())) return;

    console.log(schedule);

    await redis.sadd(moment(habit!.alarmTime, 'HH:mm').format('MMDDHHmm'), String(habit!.habitId));
    await redis.hmset(`habitId:${habit!.habitId}`, ['user', habit!.user.userId, 'title', habit!.title, 'dayOfWeek', habit!.dayOfWeek]);
    await redis.expire(`habitId:${habit!.habitId}`, 604860);
  } catch (err) {
    console.log(err);
  }
};
const UpsertAlarm = async () => {
  // alarmQueue update
  console.log('알림 스케줄러 시작 !');
  try {
    const data = await prisma.scheduler.findMany();
    for await (const schedule of data) {
      await AddSchedule(schedule);
    }
    const users = await prisma.user.findMany();
    for await (const user of users) {
      if (user.fcmToken) await redis.hmset(`user:${user.userId}`, ['isAlarmOn', '1', 'FCMToken', user.fcmToken]);
      else await redis.hmset(`user:${user.userId}`, ['isAlarmOn', '0', 'FCMToken', 'null']);
    }
  } catch (err) {
    throw new InternalServerError(err.message);
  }
  console.log('알림 스케줄러 추가 끝 =)');
  await redis.quit();
  await prisma.disconnect();
};

UpsertAlarm();
