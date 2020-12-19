import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ImageDto {
  @IsString()
  @IsNotEmpty()
  fieldname!: string;

  @IsString()
  @IsNotEmpty()
  originalname!: string;

  @IsString()
  @IsNotEmpty()
  encoding!: string;

  @IsString()
  @IsNotEmpty()
  mimetype!: string;

  buffer!: Buffer;

  @IsNumber()
  size!: number;
}
