import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AiUpdate {
  action: 'CREATE' | 'EDIT' | 'MOVE' | 'DELETE';
  cardId?: string;
  title?: string;
  details?: string;
  columnId?: string;
}

@Injectable()
export class AiUpdateService {
  private readonly logger = new Logger(AiUpdateService.name);

  constructor(private prisma: PrismaService) {}

  async apply(columnLookup: Record<string, string>, updates: AiUpdate[]) {
    for (const u of updates) {
      try {
        await this.applyOne(columnLookup, u);
      } catch (err) {
        this.logger.warn(`Failed to apply ${u.action} update: ${(err as Error).message}`);
      }
    }
  }

  private async applyOne(
    columnLookup: Record<string, string>,
    u: AiUpdate,
  ) {
    switch (u.action) {
      case 'CREATE': {
        const columnId = u.columnId || columnLookup[u.title || ''];
        if (!columnId) throw new NotFoundException('Column not found for CREATE');
        const count = await this.prisma.card.count({ where: { columnId } });
        await this.prisma.card.create({
          data: {
            columnId,
            title: u.title || 'New Card',
            details: u.details || '',
            position: count,
          },
        });
        break;
      }

      case 'EDIT': {
        if (!u.cardId) throw new NotFoundException('cardId required for EDIT');
        const existing = await this.prisma.card.findUnique({ where: { id: u.cardId } });
        if (!existing) throw new NotFoundException(`Card ${u.cardId} not found`);
        await this.prisma.card.update({
          where: { id: u.cardId },
          data: {
            ...(u.title !== undefined ? { title: u.title } : {}),
            ...(u.details !== undefined ? { details: u.details } : {}),
          },
        });
        break;
      }

      case 'MOVE': {
        if (!u.cardId || !u.columnId)
          throw new NotFoundException('cardId and columnId required for MOVE');
        const card = await this.prisma.card.findUnique({ where: { id: u.cardId } });
        if (!card) throw new NotFoundException(`Card ${u.cardId} not found`);

        const targetCount = await this.prisma.card.count({ where: { columnId: u.columnId } });
        await this.prisma.card.update({
          where: { id: u.cardId },
          data: { columnId: u.columnId, position: targetCount },
        });
        break;
      }

      case 'DELETE': {
        if (!u.cardId) throw new NotFoundException('cardId required for DELETE');
        const card = await this.prisma.card.findUnique({ where: { id: u.cardId } });
        if (!card) throw new NotFoundException(`Card ${u.cardId} not found`);

        const columnId = card.columnId;
        await this.prisma.card.delete({ where: { id: u.cardId } });

        const remaining = await this.prisma.card.findMany({
          where: { columnId },
          orderBy: { position: 'asc' },
        });
        for (let i = 0; i < remaining.length; i++) {
          await this.prisma.card.update({
            where: { id: remaining[i].id },
            data: { position: i },
          });
        }
        break;
      }
    }
  }
}
