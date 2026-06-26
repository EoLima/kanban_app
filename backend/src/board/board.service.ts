import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { MoveCardDto } from './dto/move-card.dto';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async getBoard(userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { userId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async moveCard(userId: string, dto: MoveCardDto) {
    const board = await this.getBoard(userId);

    const card = await this.prisma.card.findUnique({
      where: { id: dto.cardId },
    });
    if (!card) throw new NotFoundException('Card not found');

    if (dto.sourceColumnId === dto.targetColumnId) {
      // Reorder within same column
      const column = board.columns.find((c) => c.id === dto.sourceColumnId);
      if (!column) throw new NotFoundException('Column not found');

      const cards = column.cards;
      const draggedCard = cards.splice(dto.sourceIndex, 1)[0];
      cards.splice(dto.targetIndex, 0, draggedCard);

      for (let i = 0; i < cards.length; i++) {
        await this.prisma.card.update({
          where: { id: cards[i].id },
          data: { position: i },
        });
      }
    } else {
      // Move to different column
      const targetColumn = board.columns.find(
        (c) => c.id === dto.targetColumnId,
      );
      if (!targetColumn) throw new NotFoundException('Target column not found');

      await this.prisma.card.update({
        where: { id: dto.cardId },
        data: { columnId: dto.targetColumnId },
      });

      const targetCards = await this.prisma.card.findMany({
        where: { columnId: dto.targetColumnId },
        orderBy: { position: 'asc' },
      });

      targetCards.splice(dto.targetIndex, 0, {
        ...card,
        columnId: dto.targetColumnId,
        position: 0,
      });

      for (let i = 0; i < targetCards.length; i++) {
        await this.prisma.card.update({
          where: { id: targetCards[i].id },
          data: { position: i },
        });
      }

      // Reindex source column
      const sourceCards = await this.prisma.card.findMany({
        where: { columnId: dto.sourceColumnId },
        orderBy: { position: 'asc' },
      });

      for (let i = 0; i < sourceCards.length; i++) {
        await this.prisma.card.update({
          where: { id: sourceCards[i].id },
          data: { position: i },
        });
      }
    }

    return this.getBoard(userId);
  }
}
