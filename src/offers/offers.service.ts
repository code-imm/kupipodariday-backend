import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SafeUser } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: SafeUser) {
    const { itemId, amount, ...others } = createOfferDto;
    console.log(createOfferDto);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wish = await queryRunner.manager.findOne(Wish, {
        where: { id: itemId },
      });

      if (!wish) {
        throw new NotFoundException('Желание не найдено');
      }

      const offer = queryRunner.manager.create(Offer, {
        amount,
        ...others,
        user: { id: user.id },
        item: { id: itemId },
      });

      await queryRunner.manager.save(offer);

      wish.raised = parseFloat((Number(wish.raised) + amount).toFixed(2));
      await queryRunner.manager.save(wish);
      await queryRunner.commitTransaction();

      return offer;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.offerRepository.find();
  }

  findOne(id: number) {
    return this.offerRepository.findOne({ where: { id } });
  }
}
