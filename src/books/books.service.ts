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

  private formatBook(book: Book): object {
    const cleanBook = this.sanitizeBook(book) as any;

    return {
      ...cleanBook,
      author_id: book.author?.id,
      author_name: book.author?.name,
      author_bio: null,
      cover_url: null,
      price: Number(book.price ?? 0),
      sample_chapter: book.authorMessage,
      owner_approved: book.status === BookStatus.APROVADO,
      average_rating: 0,
      reviews_count: 0,
      reviews: [],
      feedback: book.adminNote,
    };
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
      genre: data.genre || BookGenre.OUTRO,
      author: { id: data.authorId } as any,
      status: BookStatus.PENDENTE,
      isPublished: false,
    });
    return this.formatBook(await this.booksRepo.save(book));
  }

  async findOne(bookId: number): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    return this.formatBook(book);
  }

  async findByAuthor(authorId: number): Promise<object[]> {
    const books = await this.booksRepo.find({
      where: { author: { id: authorId } },
      order: { createdAt: 'DESC' },
    });
    return books.map((b) => this.formatBook(b));
  }

  async publishBook(bookId: number, authorId: number, price?: number): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    if (book.author.id !== authorId)
      throw new ForbiddenException('Acesso negado');
    if (book.status !== BookStatus.APROVADO) {
      throw new ForbiddenException(
        'O livro precisa ser aprovado antes de ser publicado',
      );
    }
    if (price !== undefined && price >= 0) {
      book.price = price;
    }
    book.isPublished = true;
    return this.formatBook(await this.booksRepo.save(book));
  }

  async findPublished(genre?: BookGenre, authorId?: number): Promise<object[]> {
    const where: any = { isPublished: true, status: BookStatus.APROVADO };
    if (genre) where.genre = genre;
    if (authorId) where.author = { id: authorId };
    const books = await this.booksRepo.find({ where, order: { updatedAt: 'DESC' } });
    return books.map((b) => this.formatBook(b));
  }

  async findPending(): Promise<object[]> {
    const books = await this.booksRepo.find({
      where: { status: BookStatus.PENDENTE },
      order: { createdAt: 'ASC' },
    });
    return books.map((b) => this.formatBook(b));
  }

  async setInAnalysis(bookId: number): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    book.status = BookStatus.EM_ANALISE;
    return this.formatBook(await this.booksRepo.save(book));
  }

  async approveBook(bookId: number): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    book.status = BookStatus.APROVADO;
    return this.formatBook(await this.booksRepo.save(book));
  }

  async rejectBook(bookId: number, adminNote: string): Promise<object> {
    const book = await this.booksRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    book.status = BookStatus.REJEITADO;
    book.isPublished = false;
    book.adminNote = adminNote;
    return this.formatBook(await this.booksRepo.save(book));
  }

  async listAuthors(): Promise<object[]> {
    const books = await this.booksRepo.find({
      where: { isPublished: true, status: BookStatus.APROVADO },
    });
    const authors = new Map<number, { id: number; name: string; book_count: number }>();

    for (const book of books) {
      if (!book.author) continue;
      const current = authors.get(book.author.id);
      if (current) current.book_count += 1;
      else authors.set(book.author.id, { id: book.author.id, name: book.author.name, book_count: 1 });
    }

    return Array.from(authors.values());
  }
  async findAuthorProfile(authorId: number): Promise<object> {
    const books = await this.booksRepo.find({
      where: {
        author: { id: authorId },
        isPublished: true,
        status: BookStatus.APROVADO,
      },
      order: { updatedAt: 'DESC' },
    });

    if (books.length === 0) throw new NotFoundException('Autor não encontrado');

    const author = books[0].author;
    return {
      id: author.id,
      name: author.name,
      email: author.email,
      approved: true,
      bio: null,
      avatar_url: null,
      books: books.map((book) => this.formatBook(book)),
    };
  }
}
