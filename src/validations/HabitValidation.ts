import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Habit {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  dayOfWeek!: string | null;

  alarmTime!: string | null;
}

export class ID {
  @IsNumber()
  habitId!: number;
}
