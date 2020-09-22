import { Util } from './BaseUtil';

export class CommentUtil extends Util {
  private static comments = {
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
    someHabitsLeft: [
      '오늘 하루도 화이팅! 습관빵들을 구워주세요',
      '여러 습관빵들이 구워지길 기다리고 있어요.',
      '오늘 하루도 잘해보아요. 남아있는 습관빵들을 완료해주세요.',
      '남은 습관빵들을 구우신다면! 새로운 컬랙션을 얻을지도 몰라요?!',
      '습관이 여러 개 남아있어요. 조금만 힘내주세요.',
    ],
    allHabitsLeft: [
      '오늘의 습관빵을 시작해주세요!',
      '오늘의 첫 습관빵을 구워보세요!',
      '습관빵을 시작해주세요! 당신을 기다리고 있어요.',
      '시작이 반이다. 오늘의 습관빵도 시작해보세요.',
      '일찍 일어나는 새가 먹이를 먹는다. 랭킹 1등에 도전해보세요.',
    ],
    noHabitToDo: [
      '오늘은 해야할 습관이 없어요. 새로운 습관을 생성하는 건 어떤가요?',
      '오늘 나올 습관이 없네요.. 새로운 습관을 구워볼까요??',
      '습관빵을 굽고 싶은가요? 새로운 습관을 생성해주세요!',
      '습관빵과 함께 건강한 생활을 만들어 나가봐요!',
      '오늘 해야 될 첫 습관빵을 등록해주세요!',
    ],
  };

  private getComment = (key: string, index: number) => CommentUtil.comments.allDone[index];
  public selectComment = (todayHabit: number, todayDoneHabit: number) => {
    const min = Math.ceil(0);
    const max = Math.floor(5);
    const randomNumber = Math.floor(Math.random() * (max - min));
    if (todayHabit === 0) return CommentUtil.comments.noHabitToDo[randomNumber];
    else if (todayHabit === 1 && todayDoneHabit === 0) return CommentUtil.comments.allHabitsLeft[randomNumber];
    else if (todayHabit - todayDoneHabit === 0) return CommentUtil.comments.allDone[randomNumber];
    else if (todayHabit - todayDoneHabit === 1) return CommentUtil.comments.oneHabitLeft[randomNumber];
    else if (todayDoneHabit) return CommentUtil.comments.someHabitsLeft[randomNumber];
    else return CommentUtil.comments.allHabitsLeft[randomNumber];
  };
}
