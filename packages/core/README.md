# kysely-schema

> Schema-first development tool for Kysely — **Prisma's DX + Kysely's power + Zero runtime overhead**

[![npm version](https://img.shields.io/npm/v/kysely-schema.svg)](https://www.npmjs.com/package/kysely-schema)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/guntur-d/kysely-schema/blob/main/LICENSE)

## ⚠️ Development Status

This package is in early development and undergoing active testing.
Expect breaking changes between minor versions. Not recommended for
production use yet.

## Features

- 📝 **Schema-first** — Define your database schema in TypeScript
- 🔄 **Auto-migrations** — Generate Kysely migration files from schema changes
- 🎯 **Type-safe** — Auto-generate TypeScript types for your Kysely queries
- 🪶 **Lightweight** — Zero runtime overhead, pure code generation
- 💪 **Full SQL control** — Generates standard Kysely schema builder code
- 🔌 **Works with Kysely** — Complements existing Kysely migrations, doesn't replace them

## Quick Start

```bash
# Install
npm install -D kysely-schema-cli
# or
pnpm add -D kysely-schema-cli

# Initialize (installs kysely + db driver for you)
npx kysely-schema init
# or
npx kys init 
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
# or
npx kys gm "initial"

# Generate TypeScript types
npx kysely-schema generate-types
# or
npx kys gt

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

## Documentation

- [Getting Started](https://github.com/guntur-d/kysely-schema/blob/main/docs/getting-started.md)
- [Schema Definition](https://github.com/guntur-d/kysely-schema/blob/main/docs/schema-definition.md)
- [Migrations](https://github.com/guntur-d/kysely-schema/blob/main/docs/migrations.md)
- [API Reference](https://github.com/guntur-d/kysely-schema/blob/main/docs/api-reference.md)

## Contributing

This project is open source and we welcome contributions!

- 🐛 **Report bugs**: [GitHub Issues](https://github.com/guntur-d/kysely-schema/issues)
- 💡 **Feature requests**: [GitHub Discussions](https://github.com/guntur-d/kysely-schema/discussions)
- 🔀 **Pull requests**: [GitHub Repository](https://github.com/guntur-d/kysely-schema)

## License

[MIT](https://github.com/guntur-d/kysely-schema/blob/main/LICENSE)
