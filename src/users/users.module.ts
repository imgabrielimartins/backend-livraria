import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { SeedAdminService } from './seed-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, SeedAdminService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
