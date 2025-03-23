import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SafeUser } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    user: SafeUser,
  ): Promise<Wishlist> {
    const { itemsId, ...rest } = createWishlistDto;

    const wishes = await this.wishRepository.findBy({ id: In(itemsId) });
    if (wishes.length !== itemsId.length) {
      throw new NotFoundException('Один или несколько подарков не найдены');
    }

    const wishlist = this.wishlistRepository.create({
      ...rest,
      items: wishes,
      owner: user,
    });

    return this.wishlistRepository.save(wishlist);
  }

  findAll() {
    return this.wishlistRepository.find();
  }

  findOne(id: number) {
    return this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const { itemsId, ...rest } = updateWishlistDto;

    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    Object.assign(wishlist, rest);

    if (itemsId) {
      const wishes = await this.wishRepository.findBy({ id: In(itemsId) });
      if (wishes.length !== itemsId.length) {
        throw new NotFoundException('Один или несколько подарков не найдены');
      }
      wishlist.items = wishes;
    }

    return this.wishlistRepository.save(wishlist);
  }

  remove(id: number) {
    return this.wishlistRepository.delete(id);
  }
}
