import { HabitCreateInput, User } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import moment from 'moment';

moment.tz.setDefault('Aisa/Seoul');

export class CreateHabitRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  description!: string | null;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  dayOfWeek!: string;

  alarmTime!: string | null;

  public toEntity(user: User, habitDto: CreateHabitRequestDto): HabitCreateInput {
    const habitPayload: HabitCreateInput = {
      title: habitDto.title,
      description: habitDto.description,
      category: habitDto.category,
      dayOfWeek: habitDto.dayOfWeek,
      alarmTime: habitDto.alarmTime ? moment(habitDto.alarmTime, 'HH:mm').format('HH:mm') : null,
      user: {
        connect: { userId: user.userId },
      },
    };
    return habitPayload;
  }
}

export class UpdateHabitRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  description!: string | null;

  @IsString()
  @IsNotEmpty()
  category!: string;

  alarmTime!: string | null;
}

export class GetHabitRequestDto {
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
