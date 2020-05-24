import { IsNumber } from 'class-validator';

export class GoogleCallback {
  code!: string;
}

export class ID {
  @IsNumber()
  habitId!: number;

  @IsNumber()
  userId!: number;
}
