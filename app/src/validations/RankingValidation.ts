import { Ranking } from '@prisma/client';
export class AddRanking {
  userId!: number;
  userName!: string;
  exp!: number;
  achievement!: number;

  constructor(ranking: Ranking) {
    this.userId = ranking.userId;
    this.userName = ranking.userName;
    this.exp = ranking.exp;
    this.achievement = ranking.achievement;
  }
}
