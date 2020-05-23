import { Ranking } from '@prisma/client';
export class AddRanking {
  rankingId!: number;
  userName!: string;
  exp!: number;

  constructor(ranking: Ranking) {
    this.rankingId = ranking.rankingId;
    this.userName = ranking.userName;
    this.exp = ranking.exp;
  }
}
