import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<object> {
    const exists = await this.usersRepo.findOneBy({ email });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const roleMap: Record<string, UserRole> = {
      reader: UserRole.LEITOR,
      leitor: UserRole.LEITOR,
      author: UserRole.AUTOR,
      autor: UserRole.AUTOR,
    };
    const safeRole = roleMap[String(role)] ?? UserRole.LEITOR;
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({
      name,
      email,
      password: hashed,
      role: safeRole,
    });
    await this.usersRepo.save(user);
    return this.signToken(user);
  }

  async login(email: string, password: string): Promise<object> {
    const user = await this.usersRepo.findOneBy({ email });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');
    return this.signToken(user);
  }

  async me(userId: number): Promise<object> {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }

  private signToken(user: User): object {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
