import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class Habit {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  dayOfWeek!: string;

  alarmTime!: string | null;
}

export class UpdateHabit {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

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
  @Min(1)
  @Max(12)
  month!: number;
}

export class ID {
  @IsNumber()
  @IsNotEmpty()
  habitId!: number;
}
