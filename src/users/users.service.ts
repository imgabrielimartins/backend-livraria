import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepo.find();
    return users.map(({ password, ...rest }) => rest as Omit<User, 'password'>);
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const { password, ...rest } = user;
    return rest;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.usersRepo.remove(user);
  }
}
