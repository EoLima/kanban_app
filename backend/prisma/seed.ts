import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const INITIAL_COLUMNS = [
  'Backlog',
  'Discovery',
  'In Progress',
  'Review',
  'Done',
];

async function main() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log('Database already seeded, skipping.');
    return;
  }

  const passwordHash = await bcrypt.hash('password', 10);

  const user = await prisma.user.create({
    data: { username: 'user', passwordHash },
  });
  console.log('Created user:', user.id);

  const board = await prisma.board.create({
    data: { userId: user.id },
  });
  console.log('Created board:', board.id);

  for (let i = 0; i < INITIAL_COLUMNS.length; i++) {
    const col = await prisma.column.create({
      data: {
        boardId: board.id,
        title: INITIAL_COLUMNS[i],
        position: i,
      },
    });
    console.log(`Created column: ${col.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
