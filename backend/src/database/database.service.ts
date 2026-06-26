import { Injectable, OnModuleInit } from '@nestjs/common';
import { execSync } from 'child_process';
import { SeedService } from './seed.service';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private seedService: SeedService) {}

  async onModuleInit() {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    await this.seedService.seedIfNeeded();
  }
}
