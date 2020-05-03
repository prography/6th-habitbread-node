import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddHabit {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsBoolean()
  @IsNotEmpty()
  isScheduled!: boolean;

  @IsNumber()
  @IsNotEmpty()
  userId!: number;
}

export class UpdateHabit {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  category!: string;

  @IsBoolean()
  isScheduled!: boolean;
}

export class UserId {
  @IsNumber()
  userId!: number;
}

export class Id {
  @IsNumber()
  habitId!: number;

  @IsNumber()
  userId!: number;
}
