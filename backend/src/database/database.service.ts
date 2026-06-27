import { Injectable, OnModuleInit } from '@nestjs/common';
import { execSync } from 'child_process';
import { join } from 'path';
import { SeedService } from './seed.service';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private seedService: SeedService) {}

  async onModuleInit() {
    const schemaPath = join(__dirname, '..', '..', 'prisma', 'schema.prisma');
    const binDir = join(__dirname, '..', '..', 'node_modules', '.bin');
    execSync('prisma migrate deploy --schema="' + schemaPath + '"', {
      stdio: 'inherit',
      env: { ...process.env, PATH: binDir + ':' + (process.env.PATH || '') },
    });
    await this.seedService.seedIfNeeded();
  }
}
