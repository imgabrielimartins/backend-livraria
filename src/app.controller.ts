import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BooksService } from './books/books.service';
import { BookGenre } from './books/book.entity';

interface AuthRequest {
  user: { sub: number; email: string; role: string };
}

@Controller()
export class AppController {
  constructor(private booksService: BooksService) {}


  @Get('owner')
  owner() {
    return {
      id: 1,
      name: 'Sandro Gonçalves',
      email: 'contato@vereler.com',
      approved: true,
      bio: 'Escritor, ensaísta e investigador brasileiro, autor de obras nas áreas de literatura, filosofia e psicologia.',
      avatar_url: null,
    };
  }
  @Get('genres')
  genres() {
    return [
      { id: BookGenre.FICCAO, name: 'Ficção' },
      { id: BookGenre.ROMANCE, name: 'Romance' },
      { id: BookGenre.MISTERIO, name: 'Mistério' },
      { id: BookGenre.FANTASIA, name: 'Fantasia' },
      { id: BookGenre.BIOGRAFIA, name: 'Biografia' },
      { id: BookGenre.OUTRO, name: 'Outro' },
    ];
  }

  @Get('authors')
  authors() {
    return this.booksService.listAuthors();
  }


  @Get('authors/:id')
  author(@Param('id') id: string) {
    return this.booksService.findAuthorProfile(Number(id));
  }
  @Get('submissions')
  @UseGuards(JwtAuthGuard)
  submissions(@Request() req: AuthRequest) {
    if (req.user.role === 'admin') return this.booksService.findPending();
    return this.booksService.findByAuthor(req.user.sub);
  }

  @Post('submissions')
  @UseGuards(JwtAuthGuard)
  createSubmission(
    @Body()
    body: {
      title: string;
      synopsis: string;
      message?: string;
      authorMessage?: string;
      genre?: BookGenre;
    },
    @Request() req: AuthRequest,
  ) {
    return this.booksService.submit({
      title: body.title,
      synopsis: body.synopsis,
      authorMessage: body.authorMessage ?? body.message ?? '',
      genre: body.genre ?? BookGenre.OUTRO,
      authorId: req.user.sub,
    });
  }
}