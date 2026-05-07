import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum BookGenre {
  FICCAO = 'ficcao',
  ROMANCE = 'romance',
  MISTERIO = 'misterio',
  FANTASIA = 'fantasia',
  BIOGRAFIA = 'biografia',
  OUTRO = 'outro',
}

export enum BookStatus {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado',
}

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  synopsis: string;

  @Column({ type: 'text', nullable: true })
  authorMessage: string;

  @Column({ type: 'enum', enum: BookGenre, default: BookGenre.OUTRO })
  genre: BookGenre;

  @Column({ type: 'enum', enum: BookStatus, default: BookStatus.PENDENTE })
  status: BookStatus;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'text', nullable: true })
  adminNote: string;

  @ManyToOne(() => User, (user) => user.books, { eager: true })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
