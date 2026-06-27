import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AiService } from './ai.service';
import { AiUpdateService } from './ai-update.service';
import { BoardService } from '../board/board.service';
import { AuthGuard } from '../auth.guard';
import { ChatDto } from './dto/chat.dto';

@Controller('api/ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private aiUpdateService: AiUpdateService,
    private boardService: BoardService,
  ) {}

  @Post('test')
  async test() {
    const result = await this.aiService.testConnection();
    return { result };
  }

  @Post('chat')
  @UseGuards(AuthGuard)
  async chat(@Req() req: Request, @Body() dto: ChatDto) {
    const userId = req.cookies['session_id'];
    const board = await this.boardService.getBoard(userId);

    const columnLookup: Record<string, string> = {};
    for (const col of board.columns) {
      columnLookup[col.title] = col.id;
    }

    const { reply, updates } = await this.aiService.chat(board, dto.message, dto.history);

    if (updates.length > 0) {
      await this.aiUpdateService.apply(columnLookup, updates);
    }

    const freshBoard = await this.boardService.getBoard(userId);

    return { reply, updates, board: freshBoard };
  }
}
