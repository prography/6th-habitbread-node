import { HabitCreateInput, HabitUpdateInput, User } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import moment from 'moment-timezone';

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

  public toEntity(user: User): HabitCreateInput {
    const habitPayload = {
      title: this.title,
      description: this.description,
      category: this.category,
      dayOfWeek: this.dayOfWeek,
      alarmTime: this.alarmTime ? moment(this.alarmTime, 'HH:mm').format('HH:mm') : null,
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

  public toEntity(user: User): HabitUpdateInput {
    const habitPayload = {
      title: this.title,
      description: this.description,
      category: this.category,
      alarmTime: this.alarmTime ? moment(this.alarmTime, 'HH:mm').format('HH:mm') : null,
      user: {
        connect: { userId: user.userId },
      },
    };
    return habitPayload;
  }
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

export class HabitID {
  @IsNumber()
  @IsNotEmpty()
  habitId!: number;
}
