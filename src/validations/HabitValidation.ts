import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Habit {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  dayOfWeek!: string;

  alarmTime!: string | null;
}

export class ID {
  @IsNumber()
  @IsNotEmpty()
  habitId!: number;
}
