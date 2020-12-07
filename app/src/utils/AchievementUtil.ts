import moment from 'moment-timezone';
import { CommitRepository } from '../repository/CommitRepository';
import { Util } from './BaseUtil';

export class AchievementUtil extends Util {
  private commitRepository: CommitRepository;

  constructor() {
    super();
    this.commitRepository = new CommitRepository();
  }

  public async calulateAchievement(habit: any) {
    const historyCount = await this.commitRepository.countLastMonth(habit.habitId);
    
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
    if (dayCount === 0) habit.percent = 0;
    else habit.percent = Math.round((historyCount * 100) / dayCount);
    return habit;
  }
}
