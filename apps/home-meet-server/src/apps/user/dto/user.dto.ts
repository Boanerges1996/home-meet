import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  password: string;
}

export class UserLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
