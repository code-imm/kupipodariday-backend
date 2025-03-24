import { IsBoolean, IsDefined, IsNumber, Min } from 'class-validator';

export class CreateOfferDto {
  @IsDefined()
  @IsNumber({}, { message: 'Сумма должна быть числом' })
  @Min(1, { message: 'Сумма должна быть не меньше 1' })
  amount: number;

  @IsBoolean({ message: 'Поле hidden должно быть булевым значением' })
  hidden: boolean;

  @IsDefined()
  @IsNumber({})
  itemId: number;
}
