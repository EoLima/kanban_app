import { Test, TestingModule } from '@nestjs/testing';
import { AiUpdateService } from './ai-update.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AiUpdateService', () => {
  let service: AiUpdateService;
  let prisma: Record<string, jest.Mock>;

  const columnLookup = {
    Backlog: 'col-1',
    'In Progress': 'col-2',
    Done: 'col-3',
  };

  beforeEach(async () => {
    prisma = {
      card: {
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiUpdateService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AiUpdateService>(AiUpdateService);
  });

  describe('CREATE', () => {
    it('should create a card with title and columnId', async () => {
      prisma.card.count.mockResolvedValue(2);

      await service.apply(columnLookup, [
        { action: 'CREATE', title: 'New Task', columnId: 'col-1', details: 'details' },
      ]);

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: { columnId: 'col-1', title: 'New Task', details: 'details', position: 2 },
      });
    });

    it('should fall back to columnLookup by title if no columnId', async () => {
      prisma.card.count.mockResolvedValue(0);

      await service.apply(columnLookup, [
        { action: 'CREATE', title: 'Backlog' },
      ]);

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: { columnId: 'col-1', title: 'Backlog', details: '', position: 0 },
      });
    });
  });

  describe('EDIT', () => {
    it('should update card title and details', async () => {
      prisma.card.findUnique.mockResolvedValue({ id: 'card-1' });

      await service.apply(columnLookup, [
        { action: 'EDIT', cardId: 'card-1', title: 'Updated', details: 'new details' },
      ]);

      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { title: 'Updated', details: 'new details' },
      });
    });

    it('should not call update if card not found', async () => {
      prisma.card.findUnique.mockResolvedValue(null);

      await service.apply(columnLookup, [{ action: 'EDIT', cardId: 'missing' }]);

      expect(prisma.card.update).not.toHaveBeenCalled();
    });

    it('should not call update if no cardId', async () => {
      await service.apply(columnLookup, [{ action: 'EDIT' }]);

      expect(prisma.card.update).not.toHaveBeenCalled();
    });
  });

  describe('MOVE', () => {
    it('should move card to target column at the end', async () => {
      prisma.card.findUnique.mockResolvedValue({ id: 'card-1', columnId: 'col-1' });
      prisma.card.count.mockResolvedValue(3);

      await service.apply(columnLookup, [
        { action: 'MOVE', cardId: 'card-1', columnId: 'col-2' },
      ]);

      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { columnId: 'col-2', position: 3 },
      });
    });
  });

  describe('DELETE', () => {
    it('should delete card and reindex remaining', async () => {
      prisma.card.findUnique.mockResolvedValue({ id: 'card-1', columnId: 'col-1' });
      prisma.card.findMany.mockResolvedValue([
        { id: 'card-2', position: 0 },
        { id: 'card-3', position: 1 },
      ]);

      await service.apply(columnLookup, [{ action: 'DELETE', cardId: 'card-1' }]);

      expect(prisma.card.delete).toHaveBeenCalledWith({ where: { id: 'card-1' } });
      expect(prisma.card.update).toHaveBeenCalledTimes(2);
      expect(prisma.card.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'card-2' },
        data: { position: 0 },
      });
    });
  });
});
