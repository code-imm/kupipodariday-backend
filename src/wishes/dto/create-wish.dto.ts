import { IsNumber, IsString, IsUrl, Length } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateWishDto {
  @IsString()
  @Length(1, 250, { message: 'Название должно быть от 1 до 250 символов' })
  name: string;

  @IsString()
  @IsUrl({}, { message: 'Некорректная ссылка на подарок' })
  link: string;

  @IsString()
  @IsUrl({}, { message: 'Некорректная ссылка на изображение' })
  image: string;

  @IsNumber({}, { message: 'Цена должна быть числом' })
  price: number;

  @IsString()
  @Length(1, 1024, { message: 'Описание должно быть от 1 до 1024 символов' })
  description: string;

  owner: User;
}
