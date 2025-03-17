import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SafeUser, User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto copy';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    private readonly dataSource: DataSource,
  ) {}

  create(createWishDto: CreateWishDto, owner: SafeUser): Promise<Wish> {
    const wish = this.wishRepository.create({
      ...createWishDto,
      owner,
    });
    return this.wishRepository.save(wish);
  }

  findLast() {
    return this.wishRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });
  }

  findTop() {
    return this.wishRepository.findOne({
      where: {},
      order: { copied: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.wishRepository.findOne({ where: { id } });
  }

  findWishesByUserId(userId: number) {
    return this.wishRepository.find({ where: { owner: { id: userId } } });
  }

  findWishesByUsername(username: string) {
    return this.wishRepository.find({ where: { owner: { username } } });
  }

  async update(id: number, updateWishDto: UpdateWishDto) {
    const wish = await this.wishRepository.findOne({ where: { id } });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    // TODO: в OpenAPI метод ничего не возвращает
    Object.assign(wish, updateWishDto);
    return this.wishRepository.save(wish);
  }

  async remove(id: number) {
    const result = await this.wishRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Подарок не найден');
    }
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
