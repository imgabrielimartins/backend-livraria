import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedAdminService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const adminExists: User | null = await this.usersRepo.findOneBy({
      role: UserRole.ADMIN,
    });

    if (adminExists) {
      console.log(' Admin já existe, seed ignorado.');
      return;
    }

    const email: string = this.config.get<string>('ADMIN_EMAIL') ?? '';
    const password: string = this.config.get<string>('ADMIN_PASSWORD') ?? '';
    const name: string = this.config.get<string>('ADMIN_NAME') ?? '';

    const hashed: string = await bcrypt.hash(password, 10);

    const admin: User = this.usersRepo.create({
      name,
      email,
      password: hashed,
      role: UserRole.ADMIN,
    });

    await this.usersRepo.save(admin);
    console.log(`✅ Admin criado: ${email}`);
  }
}
