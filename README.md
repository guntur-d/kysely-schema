# kysely-schema

> Schema-first development tool for Kysely — **Prisma's DX + Kysely's power + Zero runtime overhead**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- 📝 **Schema-first** — Define your database schema in TypeScript
- 🔄 **Auto-migrations** — Generate Kysely migration files from schema changes
- 🎯 **Type-safe** — Auto-generate TypeScript types for your Kysely queries
- 🪶 **Lightweight** — Zero runtime overhead, pure code generation
- 💪 **Full SQL control** — Generates standard Kysely schema builder code
- 🔌 **Works with Kysely** — Complements existing Kysely migrations, doesn't replace them

## Quick Start

```bash
# This package is not yet published to npm.
# Clone the repo and build locally:
git clone https://github.com/guntur-d/kysely-schema.git
cd kysely-schema
pnpm install
pnpm build
```

Define your schema in `schema/index.ts`:

```typescript
import { defineSchema, table, column } from 'kysely-schema';

export default defineSchema({
  user: table({
    id: column.serial().primaryKey(),
    email: column.text().notNull().unique(),
    name: column.text().nullable(),
    createdAt: column.timestamp().default('now()').notNull(),
  }),

  post: table({
    id: column.serial().primaryKey(),
    title: column.text().notNull(),
    content: column.text().nullable(),
    authorId: column.integer().notNull().references('user', 'id').onDelete('cascade'),
    createdAt: column.timestamp().default('now()').notNull(),
  }),
});
```

Generate migrations and types:

```bash
# Generate a Kysely migration
npx kysely-schema generate-migration "initial"

# Generate TypeScript types
npx kysely-schema generate-types

# Run migration (standard Kysely)
npx kysely migrate:latest
```

## CLI Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `init` | — | Scaffold config, schema, migrations, and generated dirs |
| `generate-migration <name>` | `gm` | Generate a Kysely migration file from your schema |
| `generate-types` | `gt` | Generate TypeScript `Database` interface |
| `diff` | — | Show schema changes since last migration |
| `validate` | — | Validate your schema definition |
| `dev` | — | Watch schema, auto-regenerate types, validate, and show diffs |

## Comparison

| Feature | Prisma | kysely-codegen | **kysely-schema** |
|---------|--------|----------------|-------------------|
| Schema-first | ✅ | ❌ | ✅ |
| Lightweight | ❌ | ✅ | ✅ |
| Full SQL control | ❌ | ✅ | ✅ |
| Auto-migrations | ✅ | ❌ | ✅ |
| Type generation | ✅ | ✅ | ✅ |
| Runtime overhead | Heavy | None | **None** |

## What It Does NOT Do

- ❌ **Replace** Kysely's migration runner — it generates files for it
- ❌ **Add runtime overhead** — pure code generation
- ❌ **Limit SQL capabilities** — generates standard Kysely code
- ❌ **Introspect databases** — schema-first, not DB-first

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Schema Definition](./docs/schema-definition.md)
- [Migrations](./docs/migrations.md)
- [API Reference](./docs/api-reference.md)

## License

MIT
