import { IsInt, IsNotEmpty } from 'class-validator';

export class AddCharacter {
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

export class CalculateCharacter {
  @IsNotEmpty()
  @IsInt()
  userId!: number;

  @IsNotEmpty()
  @IsInt()
  value!: number;
}

export class CharacterID {
  @IsNotEmpty()
  @IsInt()
  characterId!: number;
}
