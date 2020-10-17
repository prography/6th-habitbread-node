import { IsNotEmpty, IsNumber } from 'class-validator';

export class ItemID {
  @IsNumber()
  @IsNotEmpty()
  itemId!: number;
}

// for spec test
export class AddItem {
  name!: string;
  description!: string;
  level!: number;
  img!: string;

  constructor(payload: any) {
    this.name = payload.name;
    this.description = payload.description;
    this.level = payload.level;
    this.img = payload.img;
  }
}
