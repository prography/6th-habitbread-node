import { Util } from './BaseUtil';

export class ItemUtil extends Util {
    const indexOfNextDay = checkIndexOfNextDay(moment().day(), dayOfWeek);
    let dateToAdd;
    if (indexOfNextDay <= moment().day()) dateToAdd = 7 - moment().day() + indexOfNextDay;
    else dateToAdd = indexOfNextDay - moment().day();
    await redis.sadd(moment().add(dateToAdd, 'days').format('MMDDHHmm'), habitId);
    await redis.hmset(`habitId:${habitId}`, ['user', user, 'title', title, 'dayOfWeek', dayOfWeek]);
    await redis.expire(`habitId:${habitId}`, 604860);
}