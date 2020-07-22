import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserBody {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsString()
  fcmToken!: string;
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
