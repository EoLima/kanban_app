import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BoardModule } from '../board/board.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiUpdateService } from './ai-update.service';

@Module({
  imports: [PrismaModule, BoardModule],
  controllers: [AiController],
  providers: [AiService, AiUpdateService],
})
export class AiModule {}
