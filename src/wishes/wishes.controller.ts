import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/guards/jwt.guard';
import { SafeUser } from 'src/users/entities/user.entity';
import { User } from 'src/users/user.decorator';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto copy';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() createWishDto: CreateWishDto, @User() user: SafeUser) {
    return this.wishesService.create(createWishDto, user);
  }

  @Get('/last')
  @UseGuards(JwtGuard)
  getLast() {
    return this.wishesService.findLast();
  }

  @Get('/top')
  @UseGuards(JwtGuard)
  getTop() {
    return this.wishesService.findTop();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  getById(@Param('id') id: string) {
    return this.wishesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id') id: string, @Body() updateWishDto: UpdateWishDto) {
    return this.wishesService.update(+id, updateWishDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(@Param('id') id: string) {
    return this.wishesService.remove(+id);
  }

  @Post(':id/copy')
  @UseGuards(JwtGuard)
  async copyWish(@Param('id') id: number, @User() user: SafeUser) {
    return this.wishesService.copy(id, user);
  }
}
