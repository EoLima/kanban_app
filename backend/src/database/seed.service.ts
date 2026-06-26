import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const INITIAL_COLUMNS = [
  'Backlog',
  'Discovery',
  'In Progress',
  'Review',
  'Done',
];

@Injectable()
export class SeedService {
  constructor(private prisma: PrismaService) {}

  async seedIfNeeded(): Promise<void> {
    const existing = await this.prisma.user.findFirst();
    if (existing) return;

    const passwordHash = await bcrypt.hash('password', 10);

    const user = await this.prisma.user.create({
      data: { username: 'user', passwordHash },
    });

    const board = await this.prisma.board.create({
      data: { userId: user.id },
    });

    for (let i = 0; i < INITIAL_COLUMNS.length; i++) {
      await this.prisma.column.create({
        data: {
          boardId: board.id,
          title: INITIAL_COLUMNS[i],
          position: i,
        },
      });
    }
  }
}
