# Getting Started

## Installation

```bash
# Add the core library
pnpm add kysely-schema

# Add the CLI as a dev dependency
pnpm add -D kysely-schema-cli

# Make sure you have Kysely installed
pnpm add kysely
```

## Initialize

Run the init command to scaffold the project structure:

```bash
npx kysely-schema init
```

This creates:

```
your-project/
├── schema/
│   └── index.ts           # Your schema definition
├── migrations/            # Generated migration files
├── generated/             # Generated TypeScript types
├── .kysely-schema/        # Schema snapshots (for diffing)
└── kysely-schema.config.ts
```

## Define Your Schema

Edit `schema/index.ts`:

```typescript
import { defineSchema, table, column } from 'kysely-schema';

export default defineSchema({
  user: table({
    id: column.serial().primaryKey(),
    email: column.text().notNull().unique(),
    name: column.text().nullable(),
    createdAt: column.timestamp().default('now()').notNull(),
  }),
});
```

## Generate Migration

```bash
npx kysely-schema generate-migration "initial"
```

This generates a file like `migrations/20240115T120000_initial.ts` containing:

```typescript
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text')
    .addColumn('createdAt', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').ifExists().execute();
}
```

## Generate Types

```bash
npx kysely-schema generate-types
```

This generates `generated/Database.ts`:

```typescript
import type { Generated, ColumnType } from 'kysely';

export interface UserTable {
  id: Generated<number>;
  email: string;
  name: string | null;
  createdAt: Generated<Date>;
}

export interface Database {
  user: UserTable;
}
```

## Use with Kysely

```typescript
import { Kysely, PostgresDialect } from 'kysely';
import type { Database } from './generated/Database';

const db = new Kysely<Database>({
  dialect: new PostgresDialect({ /* ... */ }),
});

// Fully typed queries!
const users = await db.selectFrom('user').selectAll().execute();
```
