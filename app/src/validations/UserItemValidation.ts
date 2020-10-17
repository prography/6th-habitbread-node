import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserItemRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userItemId!: number;
}

// for spec test
export class AddUserItem {
  userId!: number;
  itemId!: number;

  constructor(payload: any) {
    this.userId = payload.userId;
    this.itemId = payload.itemId;
  }
}
