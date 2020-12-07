import { Habit, PrismaClient } from '@prisma/client';
import moment from 'moment-timezone';
import { InternalServerError } from '../exceptions/Exception';
import RedisRepository from '../repository/RedisRepository';
moment.tz.setDefault('Asia/Seoul');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const prisma = new PrismaClient();
const redis = new RedisRepository();

const habitCheckWithUser = (habit: Habit | null) => {
  if (habit === null) return true;
  return false;
};
const calculateAlarmDay = (habit: Habit) => {
  const checkIndexOfNextDay = (todayIndex: number, dayOfWeek: string) => {
    let indexOfNextDay = todayIndex + 1;
    if (indexOfNextDay === 7) indexOfNextDay = 0;
    while (dayOfWeek[indexOfNextDay] !== '1') {
      indexOfNextDay++;
      if (indexOfNextDay === 7) indexOfNextDay = 0;
    }
    return indexOfNextDay;
  };
  const indexOfNextDay = checkIndexOfNextDay(moment().day(), habit.dayOfWeek);
  let dateToAdd;
  if (indexOfNextDay <= moment().day()) dateToAdd = 7 - moment().day() + indexOfNextDay;
  else dateToAdd = indexOfNextDay - moment().day();

  return dateToAdd;
}
const AddSchedule = async (schedule: any) => {
  try {
    const habit = await prisma.habit.findOne({
      where: { habitId: schedule.habitId }
    });
    if (habitCheckWithUser(habit)) return;
    await redis.hmset(`habitId:${habit!.habitId}`, ['user', habit!.userId, 'title', habit!.title, 'dayOfWeek', habit!.dayOfWeek]);
    await redis.expire(`habitId:${habit!.habitId}`, 604860);

    if (habit!.dayOfWeek[moment().day()] === '1') {
      const time = moment().startOf('minutes');
      const alarmTime = moment(habit!.alarmTime, 'HH:mm');
      if (time.isBefore(alarmTime)) await redis.sadd(alarmTime.format('MMDDHHmm'), String(habit!.habitId));
      else {
        const dateToAdd = calculateAlarmDay(habit!);
        const alarmTime = moment(habit!.alarmTime, 'HH:mm').add(dateToAdd, 'days');
        await await redis.sadd(alarmTime.format('MMDDHHmm'), String(habit!.habitId));
      }
    } else {
      const dateToAdd = calculateAlarmDay(habit!);
      const alarmTime = moment(habit!.alarmTime, 'HH:mm').add(dateToAdd, 'days');
      await await redis.sadd(alarmTime.format('MMDDHHmm'), String(habit!.habitId));
    }


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
