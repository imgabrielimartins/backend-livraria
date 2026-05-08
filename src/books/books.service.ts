import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book, BookGenre, BookStatus } from './book.entity';

@Injectable()
export class BooksService {
  constructor(@InjectRepository(Book) private booksRepo: Repository<Book>) {}

  private sanitizeBook(book: Book): object {
    const { password, ...author } = book.author as any;
    return { ...book, author };
  }

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
      author: { id: data.authorId } as any,
      status: BookStatus.PENDENTE,
      isPublished: false,
    });
    return this.sanitizeBook(await this.booksRepo.save(book));
  }

  async findByAuthor(authorId: number): Promise<object[]> {
    const books = await this.booksRepo.find({
      where: { author: { id: authorId } },
      order: { createdAt: 'DESC' },
    });
    return books.map((b) => this.sanitizeBook(b));
  }

  async publishBook(bookId: number, authorId: number): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    if (book.author.id !== authorId)
      throw new ForbiddenException('Acesso negado');
    if (book.status !== BookStatus.APROVADO) {
      throw new ForbiddenException(
        'O livro precisa ser aprovado antes de ser publicado',
      );
    }
    book.isPublished = true;
    return this.sanitizeBook(await this.booksRepo.save(book));
  }

  async findPublished(genre?: BookGenre, authorId?: number): Promise<object[]> {
    const where: any = { isPublished: true, status: BookStatus.APROVADO };
    if (genre) where.genre = genre;
    if (authorId) where.author = { id: authorId };
    const books = await this.booksRepo.find({ where, order: { updatedAt: 'DESC' } });
    return books.map((b) => this.sanitizeBook(b));
  }

  async findPending(): Promise<object[]> {
    const books = await this.booksRepo.find({
      where: { status: BookStatus.PENDENTE },
      order: { createdAt: 'ASC' },
    });
    return books.map((b) => this.sanitizeBook(b));
  }

  async setInAnalysis(bookId: number): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    book.status = BookStatus.EM_ANALISE;
    return this.sanitizeBook(await this.booksRepo.save(book));
  }

  async approveBook(bookId: number): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    book.status = BookStatus.APROVADO;
    return this.sanitizeBook(await this.booksRepo.save(book));
  }

  async rejectBook(bookId: number, adminNote: string): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    book.status = BookStatus.REJEITADO;
    book.isPublished = false;
    book.adminNote = adminNote;
    return this.sanitizeBook(await this.booksRepo.save(book));
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
}
