import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/guards/jwt.guard';
import { WishesService } from 'src/wishes/wishes.service';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser } from './entities/user.entity';
import { User } from './user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @Get('/me')
  @UseGuards(JwtGuard)
  async me(@User() user: SafeUser) {
    const userId = user.id;
    const foundUser = await this.usersService.findOne(userId);

    if (!foundUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    return foundUser;
  }

  // TODO: валидировать с joi
  @Patch('/me')
  @UseGuards(JwtGuard)
  update(@Body() updateUserDto: UpdateUserDto, @User() user: SafeUser) {
    const userId = user.id;
    return this.usersService.update(userId, updateUserDto);
  }

  @Get('/me/wishes')
  @UseGuards(JwtGuard)
  getWishesForCurrentUser(@User() user: SafeUser) {
    const userId = user.id;
    return this.wishesService.findWishesByUserId(userId);
  }

  @Get(':username')
  @UseGuards(JwtGuard)
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get(':username/wishes')
  @UseGuards(JwtGuard)
  getUserWishes(@Param('username') username: string) {
    return this.wishesService.findWishesByUsername(username);
  }

  @Post('/find')
  @UseGuards(JwtGuard)
  getUsers(@Body() findUsersDto: FindUsersDto) {
    return this.usersService.findByUsernameOrEmail(findUsersDto.query);
  }
}
