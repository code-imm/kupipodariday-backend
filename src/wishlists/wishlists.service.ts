import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SafeUser } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

const ERROR_MESSAGES = {
  WISH_NOT_FOUND: 'Один или несколько подарков не найдены',
  WISH_NOT_OWNED: 'Один или несколько подарков не принадлежат вам',
  WISHLIST_NOT_FOUND: 'Вишлист не найден',
  WISHLIST_FORBIDDEN: 'Вы не можете удалить чужой вишлист',
};

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

    const wishes = await this.wishRepository.find({
      where: { id: In(itemsId) },
      relations: ['owner'],
    });

    if (wishes.length !== itemsId.length) {
      throw new NotFoundException(ERROR_MESSAGES.WISH_NOT_FOUND);
    }

    const isAllWishesBelongToUser = wishes.every(
      (wish) => wish.owner.id === user.id,
    );
    if (!isAllWishesBelongToUser) {
      throw new BadRequestException(ERROR_MESSAGES.WISH_NOT_OWNED);
    }

    const wishlist = this.wishlistRepository.create({
      ...rest,
      items: wishes,
      owner: user,
    });

    return this.wishlistRepository.save(wishlist);
  }

  async findAll(): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      relations: ['owner', 'items', 'items.owner'],
    });
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
      throw new NotFoundException(ERROR_MESSAGES.WISHLIST_NOT_FOUND);
    }

    Object.assign(wishlist, rest);

    if (itemsId) {
      const wishes = await this.wishRepository.findBy({ id: In(itemsId) });
      if (wishes.length !== itemsId.length) {
        throw new NotFoundException(ERROR_MESSAGES.WISH_NOT_FOUND);
      }
      wishlist.items = wishes;
    }

    return this.wishlistRepository.save(wishlist);
  }

  async remove(id: number, user: SafeUser) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!wishlist) {
      throw new NotFoundException(ERROR_MESSAGES.WISHLIST_NOT_FOUND);
    }

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException(ERROR_MESSAGES.WISHLIST_FORBIDDEN);
    }

    const result = await this.wishlistRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(ERROR_MESSAGES.WISHLIST_NOT_FOUND);
    }

    return {};
  }
}
