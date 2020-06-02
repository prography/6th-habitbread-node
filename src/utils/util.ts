import moment from 'moment-timezone';

export class Util {
  public static calulateAchievement(habit: any) {
    let dayCount = 0,
      stack = 30;
    for (let i = moment().day(); i >= 0; --i) {
      if (habit.dayOfWeek[i] === '1') dayCount++;
      stack--;
    }
    let dayCheck = 0;
    for (let i = 0; i < 7; ++i) if (habit.dayOfWeek[i] === '1') dayCheck++;
    dayCount += (stack / 7) * dayCheck;
    for (let i = 7 - (stack % 7); i < 7; ++i) if (habit.dayOfWeek[i] === '1') dayCount++;

    habit.percent = Math.round((habit.commitHistory.length * 100) / dayCount);
    delete habit.commitHistory;
    delete habit.dayOfWeek;
    return habit;
  }
}
