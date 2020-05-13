import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Habit {
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
}

export class ID {
  @IsNumber()
  habitId!: number;

  @IsNumber()
  userId!: number;
}
