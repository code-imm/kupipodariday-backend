import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString({ message: 'Название должно быть строкой' })
  name: string;

  @IsUrl({}, { message: 'Некорректная ссылка на изображение' })
  image: string;

  @IsArray({ message: 'Поле itemsId должно быть массивом' })
  @ArrayMinSize(1, { message: 'Добавьте хотя бы один подарок в вишлист' })
  @IsNumber(
    {},
    { each: true, message: 'Каждый элемент itemsId должен быть числом' },
  )
  itemsId: number[];
}
