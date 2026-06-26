import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { BoardService } from './board.service';
import { AuthGuard } from '../auth.guard';
import { MoveCardDto } from './dto/move-card.dto';

@Controller('api/board')
@UseGuards(AuthGuard)
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get()
  async getBoard(@Req() req: Request) {
    const userId = req.cookies['session_id'];
    return this.boardService.getBoard(userId);
  }

  @Put('move')
  async moveCard(@Req() req: Request, @Body() dto: MoveCardDto) {
    const userId = req.cookies['session_id'];
    return this.boardService.moveCard(userId, dto);
  }
}
