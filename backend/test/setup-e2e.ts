import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';

export default function setup() {
  process.env.DATABASE_URL = 'file:./prisma/test-e2e.db';

  const dbPath = 'prisma/test-e2e.db';
  const journalPath = dbPath + '-journal';

  if (existsSync(dbPath)) unlinkSync(dbPath);
  if (existsSync(journalPath)) unlinkSync(journalPath);

  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}
