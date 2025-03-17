import {
  IsDefined,
  IsEmail,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsDefined()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  about: string;

  @IsString()
  @IsUrl()
  avatar: string;

  @IsDefined()
  @IsString()
  @IsEmail()
  email: string;

  // TODO: OpenAPI, minLength 2
  @IsDefined()
  @IsString()
  @MinLength(2)
  password: string;
}
