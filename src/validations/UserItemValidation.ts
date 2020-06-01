import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserItemID {
  @IsNumber()
  @IsNotEmpty()
  userItemId!: number;
}

export class AddUserItem {
  userId!: number;
  itemId!: number;

  constructor(payload: any) {
    this.userId = payload.userId;
    this.itemId = payload.itemId;
  }
}