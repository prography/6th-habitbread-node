import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddUser {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}
