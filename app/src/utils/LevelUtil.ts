import { Util } from './BaseUtil';

export class LevelUtil extends Util {
  // levels[1] : 1 -> 2로가는 레벨업 필요 경험치
  public levels: Array<number> = [];
  private maxLevel = 20; // 20레벨까지
  private interval = 50;

  private static util: null | LevelUtil = null;

  // 등차수열 초기화 (10레벨 이후 부터는 필요 경험치 +500으로 고정)
  constructor() {
    super();
    let sum = 0;
    for (let i = 0; i < this.maxLevel; i++) {
      if (i < 10) sum += this.interval * i;
      else sum += 500;
      this.levels.push(sum);
    }
  }

  private getPercent(exp: number, preRequiredExp: number, nextRequiredExp: number) {
    const current = exp - preRequiredExp;
    const total = nextRequiredExp - preRequiredExp;
    if (total === 0) throw new Error('getPercent Function Error !');
    return Math.floor((current / total) * 100);
  }

  // 현재 경험치의 레벨, 퍼센트를 반환하는 메소드
  public getLevelsAndPercents(exp: number) {
    let level = 0;
    let percent = 0;

    // 최대 레벨일 경우
    if (exp >= this.levels[this.maxLevel - 1]) return { level: this.maxLevel, percent: 100 };

    for (let i = 1; i < this.maxLevel; i++) {
      // i -> i+1 레벨로 가기 위한 레벨업 경험치를 못 넘은 경우
      if (exp < this.levels[i]) {
        level = i;
        percent = this.getPercent(exp, this.levels[i - 1], this.levels[i]);
        break;
      } else if (exp === this.levels[i]) {
        level = i + 1;
        percent = 0;
        break;
      }
    }
    return { level, percent };
  }

  // 현재 경험치와 업데이트된 경험치를 비교
  public compareLevels(currentExp: number, updateExp: number) {
    const { ...current } = this.getLevelsAndPercents(currentExp);
    const { ...update } = this.getLevelsAndPercents(updateExp);

    if (current.level === update.level) return true;
    else return false;
  }
}
