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
import { BookStage, BookGenre } from './book.entity';

interface AuthRequest {
  user: { sub: number; email: string; role: string };
}

@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Get('published')
  findPublished(
    @Query('genre') genre?: BookGenre,
    @Query('authorId') authorId?: number,
  ) {
    return this.booksService.findPublished(genre, authorId);
  }

  @Patch(':id/analysis')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  setInAnalysis(@Param('id') id: number) {
    return this.booksService.setInAnalysis(id);
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

  @Patch(':id/stage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStage(@Param('id') id: number, @Body() body: { stage: BookStage }) {
    return this.booksService.updateStage(id, body.stage);
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
