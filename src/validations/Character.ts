import { IsInt, IsNotEmpty } from 'class-validator';

export class Character {
  @IsNotEmpty()
  @IsInt()
  userId!: number;

  @IsNotEmpty()
  @IsInt()
  exp = 0;

  constructor(userId: number) {
    this.userId = userId;
  }
}
