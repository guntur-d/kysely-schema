import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { Migrator, FileMigrationProvider } from 'kysely';
import { db } from './db';

async function migrate() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(import.meta.dirname, 'migrations'),
    }),
  });

  const { results, error } = await migrator.migrateToLatest();

  results?.forEach((r) => {
    if (r.status === 'Success') {
      console.log(`  ✔ ${r.migrationName}`);
    } else if (r.status === 'Error') {
      console.error(`  ✖ ${r.migrationName}`);
    }
  });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('\n✨ All migrations applied.');
  await db.destroy();
}

migrate();
