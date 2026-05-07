import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Book } from '../books/book.entity';

export enum UserRole {
  LEITOR = 'leitor',
  AUTOR = 'autor',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.LEITOR })
  role: UserRole;

  @OneToMany(() => Book, (book) => book.author)
  books: Book[];
}
