import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    const hashedPassword = await this.hashPassword(password);

    const user = this.userRepository.create({
      ...rest,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  findByUsername(
    username: string,
    includePassword = false,
  ): Promise<User | null> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username });

    if (includePassword) {
      query.addSelect('user.password');
    }

    return query.getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = plainToInstance(UpdateUserDto, updateUserDto);
    const errors = await validate(user);

    if (errors.length > 0) {
      throw new BadRequestException('Ошибка валидации переданных значений');
    }

    return this.userRepository.save({ id, ...updateUserDto });
  }

  findByUsernameOrEmail(query: string): Promise<User[]> {
    return this.userRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
    });
  }
}
