# Migrations

## How It Works

kysely-schema generates standard Kysely migration files. It does **not** replace Kysely's migration runner — it produces the code that the runner executes.

```
schema/index.ts  →  kysely-schema generate-migration  →  migrations/*.ts
                                                              ↓
                                                    npx kysely migrate:latest
```

## Generating Migrations

```bash
# First migration (full CREATE TABLE)
npx kysely-schema generate-migration "initial"

# After schema changes
npx kysely-schema diff          # Preview changes
npx kysely-schema generate-migration "add_posts"
```

## Generated Migration Structure

Every migration file exports `up()` and `down()` functions:

```typescript
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').ifExists().execute();
}
```

## Schema Snapshots

When you generate a migration, kysely-schema saves a snapshot of your current schema in `.kysely-schema/latest.json`. This is used by the `diff` command to detect what changed.

## Tips

- **Review generated migrations** before running them — they are regular TypeScript files you can edit.
- **Tables are dropped in reverse order** in `down()` to respect foreign key constraints.
- **Foreign key columns** automatically get an index created for them.
- Use `kysely-schema validate` to catch schema errors before generating.
