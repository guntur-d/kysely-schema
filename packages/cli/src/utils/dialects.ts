/**
 * Database connection + migration runner templates for each dialect.
 */

import { KYSELY_VERSION } from './version.js';

export interface DialectInfo {
    label: string;
    value: string;
    packages: string[];
    dbTemplate: string;
    migrateTemplate: string;
}

const ky = `kysely@${KYSELY_VERSION}`;

export const DIALECTS: DialectInfo[] = [
    {
        label: 'PostgreSQL',
        value: 'postgres',
        packages: [ky, 'pg'],
        dbTemplate: `import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './generated/Database';

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? 'mydb',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
    }),
  }),
});
`,
        migrateTemplate: `import { promises as fs } from 'node:fs';
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
      console.log(\`  ✔ \${r.migrationName}\`);
    } else if (r.status === 'Error') {
      console.error(\`  ✖ \${r.migrationName}\`);
    }
  });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('\\n✨ All migrations applied.');
  await db.destroy();
}

migrate();
`,
    },
    {
        label: 'MySQL',
        value: 'mysql',
        packages: [ky, 'mysql2'],
        dbTemplate: `import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import type { Database } from './generated/Database';

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME ?? 'mydb',
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
    }),
  }),
});
`,
        migrateTemplate: `import { promises as fs } from 'node:fs';
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
      console.log(\`  ✔ \${r.migrationName}\`);
    } else if (r.status === 'Error') {
      console.error(\`  ✖ \${r.migrationName}\`);
    }
  });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('\\n✨ All migrations applied.');
  await db.destroy();
}

migrate();
`,
    },
    {
        label: 'SQLite',
        value: 'sqlite',
        packages: [ky, 'better-sqlite3'],
        dbTemplate: `import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import type { Database as DB } from './generated/Database';

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: new Database(process.env.DB_PATH ?? 'app.db'),
  }),
});
`,
        migrateTemplate: `import { promises as fs } from 'node:fs';
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
      console.log(\`  ✔ \${r.migrationName}\`);
    } else if (r.status === 'Error') {
      console.error(\`  ✖ \${r.migrationName}\`);
    }
  });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('\\n✨ All migrations applied.');
  await db.destroy();
}

migrate();
`,
    },
    {
        label: 'MSSQL (SQL Server)',
        value: 'mssql',
        packages: [ky, 'tedious', 'tarn'],
        dbTemplate: `import { Kysely, MssqlDialect } from 'kysely';
import * as Tedious from 'tedious';
import * as Tarn from 'tarn';
import type { Database } from './generated/Database';

export const db = new Kysely<Database>({
  dialect: new MssqlDialect({
    tpiPool: new Tarn.Pool({
      min: 0,
      max: 10,
      create: async () =>
        await new Promise((resolve, reject) => {
          const connection = new Tedious.Connection({
            server: process.env.DB_HOST ?? 'localhost',
            authentication: {
              type: 'default',
              options: {
                userName: process.env.DB_USER ?? 'sa',
                password: process.env.DB_PASSWORD ?? '',
              },
            },
            options: {
              database: process.env.DB_NAME ?? 'mydb',
              port: Number(process.env.DB_PORT ?? 1433),
              trustServerCertificate: true,
            },
          });
          connection.connect((err) => (err ? reject(err) : resolve(connection)));
        }),
      destroy: async (connection) => connection.close(),
    }),
  }),
});
`,
        migrateTemplate: `import { promises as fs } from 'node:fs';
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
      console.log(\`  ✔ \${r.migrationName}\`);
    } else if (r.status === 'Error') {
      console.error(\`  ✖ \${r.migrationName}\`);
    }
  });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('\\n✨ All migrations applied.');
  await db.destroy();
}

migrate();
`,
    },
];

export function getDialect(value: string): DialectInfo | undefined {
    return DIALECTS.find((d) => d.value === value);
}
