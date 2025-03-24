import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SafeUser } from 'src/users/entities/user.entity';
import { User } from 'src/users/user.decorator';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OffersService } from './offers.service';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() createOfferDto: CreateOfferDto, @User() user: SafeUser) {
    return this.offersService.create(createOfferDto, user);
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(+id);
  }
}
