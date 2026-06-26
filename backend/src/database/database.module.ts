import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseService } from './database.service';
import { SeedService } from './seed.service';

@Module({
  imports: [PrismaModule],
  providers: [DatabaseService, SeedService],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private databaseService: DatabaseService) {}

  onModuleInit() {
    // DatabaseService.onModuleInit runs first via NestJS lifecycle
  }
}
