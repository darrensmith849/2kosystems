import type { Config } from 'drizzle-kit';

const url = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL ?? '';

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
  verbose: true,
  strict: true,
} satisfies Config;
