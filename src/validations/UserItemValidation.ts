import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserItemID {
  @IsNumber()
  @IsNotEmpty()
  userItemId!: number;
}
