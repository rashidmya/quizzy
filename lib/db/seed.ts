import { db } from './drizzle';
import { todos } from './schema';
import { seed } from 'drizzle-seed';

async function main() {
  await seed(db, { todos }).refine((f) => ({
    todos: {
      columns: {
        text: f.loremIpsum(),
      },
      count: 5,
    },
  }));
  process.exit();
}

main();
