import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Extend the global scope to include a cached client.
declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

// Reuse the client if it already exists, otherwise create a new one.
export const client = global.__pgClient || postgres(process.env.POSTGRES_URL, { max: 10 });
if (!global.__pgClient) {
  global.__pgClient = client;
}
export const db = drizzle(client, { schema });
