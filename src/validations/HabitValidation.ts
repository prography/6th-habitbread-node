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

export class UpdateHabit {
  alarmTime!: string | null;
}

export class GetHabit {
  @IsNumber()
  @IsNotEmpty()
  habitId!: number;

  @IsNumber()
  @IsNotEmpty()
  year!: number;

  @IsNumber()
  @IsNotEmpty()
  month!: number;
}

export class ID {
  @IsNumber()
  @IsNotEmpty()
  habitId!: number;
}
