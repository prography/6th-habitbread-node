import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

export class CalculateUser {
  @IsNumber()
  @IsNotEmpty()
  exp!: number;
}
