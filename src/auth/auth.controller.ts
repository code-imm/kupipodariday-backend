import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LocalGuard } from 'src/guards/local.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SafeUser } from 'src/users/entities/user.entity';
import { User } from 'src/users/user.decorator';
import { UsersService } from 'src/users/users.service';
import { QueryFailedError } from 'typeorm';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('/signin')
  @HttpCode(200)
  signin(@User() user: SafeUser) {
    return this.authService.auth(user);
  }

  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return user;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if ('code' in error && error.code === '23505') {
          throw new ConflictException(
            'Пользователь с таким email или username уже зарегистрирован',
          );
        }
      }

      throw error;
    }
  }
}
