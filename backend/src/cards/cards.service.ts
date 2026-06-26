import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async create(columnId: string, title: string, details?: string) {
    const count = await this.prisma.card.count({ where: { columnId } });
    return this.prisma.card.create({
      data: { columnId, title, details: details || '', position: count },
    });
  }

  async update(
    id: string,
    data: { title?: string; details?: string; columnId?: string },
  ) {
    const card = await this.prisma.card.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('Card not found');

    return this.prisma.card.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const card = await this.prisma.card.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('Card not found');

    await this.prisma.card.delete({ where: { id } });

    // Reindex remaining cards in the column
    const cards = await this.prisma.card.findMany({
      where: { columnId: card.columnId },
      orderBy: { position: 'asc' },
    });

    for (let i = 0; i < cards.length; i++) {
      await this.prisma.card.update({
        where: { id: cards[i].id },
        data: { position: i },
      });
    }
  }
}
