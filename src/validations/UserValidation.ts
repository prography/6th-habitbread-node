import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetUsersQuery {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  fcmToken!: string;
}

export class CalculateUserExp {
  @IsNumber()
  @IsNotEmpty()
  exp!: number;
}

// Spec Test Util
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
