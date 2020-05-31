import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CalculateUser {
  @IsNumber()
  @IsNotEmpty()
  exp!: number;
}

export class AddUser {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  oauthKey!: string;

  constructor(payload: any) {
    this.name = payload.name;
    this.oauthKey = payload.oauthKey;
  }
}
