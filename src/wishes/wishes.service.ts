import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SafeUser } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto copy';
import { Wish } from './entities/wish.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    private readonly dataSource: DataSource,
  ) {}

  create(createWishDto: CreateWishDto, owner: SafeUser): Promise<Wish> {
    const wish = this.wishRepository.create({
      ...createWishDto,
      owner: { id: owner.id },
    });

    return this.wishRepository.save(wish);
  }

  findLast() {
    return this.wishRepository.find({
      where: {},
      order: { createdAt: 'DESC' },
      take: 40,
    });
  }

  findTop() {
    return this.wishRepository.find({
      where: {},
      order: { copied: 'DESC' },
      take: 20,
    });
  }

  async findOne(id: number) {
    const wish = await this.wishRepository
      .createQueryBuilder('wish')
      .leftJoinAndSelect('wish.owner', 'owner')
      .leftJoinAndSelect('wish.offers', 'offers')
      .leftJoinAndSelect('offers.user', 'user')
      .where('wish.id = :id', { id })
      .getOne();

    if (!wish) {
      return null;
    }

    wish.offers = wish.offers.map((offer) => {
      const { user, ...rest } = offer;
      return {
        ...rest,
        name: user?.username,
      };
    });

    return wish;
  }

  findWishesByUserId(userId: number) {
    return this.wishRepository.find({ where: { owner: { id: userId } } });
  }

  findWishesByUsername(username: string) {
    return this.wishRepository.find({ where: { owner: { username } } });
  }

  async update(id: number, updateWishDto: UpdateWishDto, user: SafeUser) {
    const plainWish = plainToInstance(UpdateWishDto, updateWishDto);
    const errors = await validate(plainWish);

    if (errors.length > 0) {
      throw new BadRequestException('Ошибка валидации переданных значений');
    }

    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Вы не можете редактировать чужой подарок');
    }

    Object.assign(wish, updateWishDto);
    return this.wishRepository.save(wish);
  }

  async remove(id: number, user: SafeUser) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Вы не можете удалить чужой подарок');
    }

    await this.wishRepository.delete(id);
  }

  async copy(id: number, user: SafeUser): Promise<Wish> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const originalWish = await queryRunner.manager.findOne(Wish, {
        where: { id },
      });

      if (!originalWish) {
        throw new NotFoundException('Подарок не найден');
      }

      const copiedWish = queryRunner.manager.create(Wish, {
        ...originalWish,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        copied: 0,
        owner: user,
      });

      originalWish.copied += 1;
      await queryRunner.manager.save(originalWish);

      const savedCopiedWish = await queryRunner.manager.save(copiedWish);

      await queryRunner.commitTransaction();

      return savedCopiedWish;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
