import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser, User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Ошибка валидации переданных значений',
  EMAIL_OR_USERNAME_TAKEN:
    'Пользователь с таким email или username уже зарегистрирован',
};

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

  async update(user: SafeUser, updateUserDto: UpdateUserDto) {
    const updatedUser = plainToInstance(UpdateUserDto, updateUserDto);
    const errors = await validate(updatedUser);

    if (errors.length > 0) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION_FAILED);
    }

    const whereConditions = [];

    if (updateUserDto.email) {
      whereConditions.push({ email: updateUserDto.email, id: Not(user.id) });
    }

    if (updateUserDto.username) {
      whereConditions.push({
        username: updateUserDto.username,
        id: Not(user.id),
      });
    }

    const existingUser = await this.userRepository.findOne({
      where: whereConditions,
    });

    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_OR_USERNAME_TAKEN);
    }

    return this.userRepository.save({ id: user.id, ...updateUserDto });
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
