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

  @IsNumber()
  @IsNotEmpty()
  userId!: number;
}
