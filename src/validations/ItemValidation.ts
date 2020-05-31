import { IsNotEmpty, IsNumber } from 'class-validator';

export class ItemID {
  @IsNumber()
  @IsNotEmpty()
  itemId!: number;
}
