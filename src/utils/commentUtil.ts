import { Util } from './BaseUtil';

export class Comments extends Util {
  public static comments: Record<string, Array<string>> = {
    allDone: [
      '모든 습관을 다 구우셨어요! 새로운 습관을 하나 더 만드시는 건 어떤가요?',
      '오늘의 습관빵들이 전부 만들어졌어요!',
      '정말 부지런하시군요~ 좋은 습관이 생기실거에요',
      '당신의 열기로 습관빵들이 노릇노릇 구워졌어요!',
      '습관을 전부 마무리하셨네요! 오늘 하루의 마무리도 화이팅!',
    ],
    oneHabitLeft: [
      '오늘의 습관이 하나 남았어요! 조금만 힘내세요.',
      '마지막 습관빵을 오븐에 구워주세요!',
      '오늘 하루도 화이팅! 마지막 습관을 완료해주세요.',
      '습관 하나만 더 구우면 당신도 제빵왕 김탁구~',
      '습관빵 한 개가 구워지길 기다리고 있어요.',
    ],
    someHabitsLeft: ['습관 여러 개 남음 - 1', '습관 여러 개 남음 - 2', '습관 여러 개 남음 - 3', '습관 여러 개 남음 - 4', '습관 여러 개 남음 - 5'],
    allHabitsLeft: ['습관 하나도 안함 - 1', '습관 하나도 안함 - 2', '습관 하나도 안함 - 3', '습관 하나도 안함 - 4', '습관 하나도 안함 - 5'],
  };

  public static getComment = (key: string, index: number) => Comments.comments[`${key}`][index];
  public static selectComment = (todayHabit: number, todayLeftHabit: number) => {
    const min = Math.ceil(0);
    const max = Math.floor(5);
    const randomNumber = Math.floor(Math.random() * (max - min));
    console.log(randomNumber);
    if (todayHabit === 0) return '오늘은 해야할 습관이 없어요. 새로운 습관을 생성하는 건 어떤가요?';
    else if (todayHabit - todayLeftHabit === todayHabit) return Comments.getComment('allDone', randomNumber);
    else if (todayHabit - todayLeftHabit === todayHabit - 1) return Comments.getComment('leftOneHabit', randomNumber);
    else if (todayLeftHabit) return Comments.getComment('someHabitsLeft', randomNumber);
    else return Comments.getComment('allHabitLeft', randomNumber);
  };
}
