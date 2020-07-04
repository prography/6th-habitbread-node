import { PrismaClient } from '@prisma/client';
import moment from 'moment-timezone';
import { HabitIncludeUser } from '../@types/types-custom';
import { InternalServerError } from '../exceptions/Exception';
import { RedisUtil } from '../utils/RedisUtil';
moment.tz.setDefault('Asia/Seoul');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const prisma = new PrismaClient();
const redis = new RedisUtil({
  host: '49.50.163.233',
  port: 6379,
  password: 'zlekfl123!!',
});

const habitCheckWithUser = (habit: HabitIncludeUser | null) => {
  if (habit === null) return true;
  if (habit.alarmTime === null || habit.user.fcmToken === null) return true;
  if (habit.dayOfWeek[moment().day()] === '0') return true;
  return false;
};

const AddSchedule = async (schedule: any) => {
  try {
    console.log(schedule);
    const habit = await prisma.habit.findOne({
      where: { habitId: schedule.habitId },
      select: { user: true, habitId: true, alarmTime: true, title: true, dayOfWeek: true },
    });
    if (habitCheckWithUser(habit)) return;
    await redis.sadd(moment(habit!.alarmTime, 'HH:mm:ss').format('MMDDHHmm'), String(habit!.habitId));
    await redis.hmset(`habitId:${String(habit!.habitId)}`, ['userId', habit!.user.userId, 'title', habit!.title, 'dayOfWeek', habit!.dayOfWeek]);
    await redis.expire(`habitId:${String(habit!.habitId)}`, 604800);
    await redis.hmset(`userId:${String(habit!.user.userId)}`, ['isAlarmOn', 1, 'FCMToken', habit!.user.fcmToken!]);
    await redis.expire(`userId:${String(habit!.user.userId)}`, 604800);
    await redis.setbit('habitCheck', habit!.habitId, '1');
  } catch (err) {
    console.log(err);
  }
};
const UpsertAlarm = async () => {
  // alarmQueue update
  console.log('습관빵 알림 리스트 시작~!');
  try {
    const data = await prisma.scheduler.findMany();
    for await (const schedule of data) {
      await AddSchedule(schedule);
    }
  } catch (err) {
    throw new InternalServerError(err.message);
  }
  console.log('추가 끝 =)');
  redis.closeRedis();
  prisma.disconnect();
};

UpsertAlarm();
