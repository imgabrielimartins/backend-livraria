import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book, BookStage, BookGenre, BookStatus } from './book.entity';

@Injectable()
export class BooksService {
  constructor(@InjectRepository(Book) private booksRepo: Repository<Book>) {}

  async submit(data: {
    title: string;
    synopsis: string;
    authorMessage: string;
    genre: BookGenre;
    authorId: number;
  }): Promise<object> {
    const book = this.booksRepo.create({
      title: data.title,
      synopsis: data.synopsis,
      authorMessage: data.authorMessage,
      genre: data.genre,
      author: { id: data.authorId },
      stage: BookStage.RASCUNHO,
      status: BookStatus.PENDENTE,
    });
    const saved = await this.booksRepo.save(book);
    return this.withProgress(saved);
  }

  async setInAnalysis(bookId: number): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');

    book.status = BookStatus.EM_ANALISE;
    return await this.booksRepo.save(book);
  }

  async findByAuthor(authorId: number): Promise<object[]> {
    const books = await this.booksRepo.find({
      where: { author: { id: authorId } },
      order: { createdAt: 'DESC' },
    });
    return books.map((b) => this.withProgress(b));
  }

  async findPublished(genre?: BookGenre, authorId?: number): Promise<object[]> {
    const where: any = { status: BookStatus.APROVADO, isPublished: true };
    if (genre) where.genre = genre;
    if (authorId) where.author = { id: authorId };

    const books = await this.booksRepo.find({
      where,
      order: { updatedAt: 'DESC' },
    });
    return books.map((b) => this.withProgress(b));
  }

  async findPending(): Promise<object[]> {
    const books = await this.booksRepo.find({
      where: { status: BookStatus.PENDENTE },
      order: { createdAt: 'ASC' },
    });
    return books.map((b) => this.withProgress(b));
  }

  async updateStage(bookId: number, stage: BookStage): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');

    book.stage = stage;
    const saved = await this.booksRepo.save(book);
    return this.withProgress(saved);
  }

  async approveBook(bookId: number): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');

    book.status = BookStatus.APROVADO;
    book.isPublished = true;
    const saved = await this.booksRepo.save(book);
    return this.withProgress(saved);
  }

  async rejectBook(bookId: number, adminNote: string): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');

    book.status = BookStatus.REJEITADO;
    book.isPublished = false;
    book.adminNote = adminNote;
    const saved = await this.booksRepo.save(book);
    return this.withProgress(saved);
  }

  async listAuthors(): Promise<object[]> {
    return this.booksRepo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author')
      .where('book.isPublished = true')
      .select(['author.id', 'author.name'])
      .distinct(true)
      .getRawMany();
  }

  private withProgress(book: Book): object {
    return { ...book, progress: stageProgress[book.stage] };
  }
}
