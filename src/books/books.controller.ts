import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BooksService } from './books.service';
import { BookGenre } from './book.entity';

interface AuthRequest {
  user: { sub: number; email: string; role: string };
}

@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Get()
  findAll(@Query('genre') genre?: BookGenre, @Query('author_id') authorId?: string) {
    return this.booksService.findPublished(genre, authorId ? Number(authorId) : undefined);
  }

  @Get('published')
  findPublished(
    @Query('genre') genre?: BookGenre,
    @Query('authorId') authorId?: number,
  ) {
    return this.booksService.findPublished(genre, authorId);
  }

  @Get('authors')
  listAuthors() {
    return this.booksService.listAuthors();
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findPending() {
    return this.booksService.findPending();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  mine(@Request() req: AuthRequest) {
    return this.booksService.findByAuthor(req.user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  submit(
    @Body()
    body: {
      title: string;
      synopsis: string;
      authorMessage: string;
      genre: BookGenre;
    },
    @Request() req: AuthRequest,
  ) {
    return this.booksService.submit({ ...body, authorId: req.user.sub });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(Number(id));
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  publish(
    @Param('id') id: number,
    @Body() body: { price?: number },
    @Request() req: AuthRequest,
  ) {
    return this.booksService.publishBook(id, req.user.sub, body.price);
  }

  @Patch(':id/analysis')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  setInAnalysis(@Param('id') id: number) {
    return this.booksService.setInAnalysis(id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  approve(@Param('id') id: number) {
    return this.booksService.approveBook(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reject(@Param('id') id: number, @Body() body: { adminNote: string }) {
    return this.booksService.rejectBook(id, body.adminNote);
  }
}
