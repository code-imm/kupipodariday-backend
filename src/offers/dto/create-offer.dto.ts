import { IsBoolean, IsDefined, IsNumber, Min } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateOfferDto {
  @IsDefined()
  @IsNumber({}, { message: 'Сумма должна быть числом' })
  @Min(1, { message: 'Сумма должна быть не меньше 1' })
  //TODO: validation
  amount: number;

  @IsBoolean({ message: 'Поле hidden должно быть булевым значением' })
  hidden: boolean;

  @IsDefined()
  @IsNumber({})
  itemId: number;

  user: User;
}
