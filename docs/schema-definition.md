# Schema Definition

## Table & Column DSL

Define tables using the `table()` helper and columns using the `column` factory:

```typescript
import { defineSchema, table, column } from 'kysely-schema';

export default defineSchema({
  tableName: table({
    columnName: column.type().modifier1().modifier2(),
  }),
});
```

## Column Types

| DSL | SQL Type | TypeScript Type |
|-----|----------|-----------------|
| `column.serial()` | `serial` | `Generated<number>` |
| `column.integer()` | `integer` | `number` |
| `column.bigint()` | `bigint` | `string` |
| `column.decimal(p, s)` | `decimal(p, s)` | `string` |
| `column.text()` | `text` | `string` |
| `column.varchar(n)` | `varchar(n)` | `string` |
| `column.timestamp()` | `timestamp` | `Date` |
| `column.date()` | `date` | `Date` |
| `column.time()` | `time` | `string` |
| `column.boolean()` | `boolean` | `boolean` |
| `column.json()` | `json` | `unknown` |
| `column.jsonb()` | `jsonb` | `unknown` |
| `column.binary()` | `binary` | `Buffer` |
| `column.uuid()` | `uuid` | `string` |

## Column Modifiers

| Modifier | Description |
|----------|-------------|
| `.primaryKey()` | Mark as primary key |
| `.notNull()` | NOT NULL constraint |
| `.nullable()` | Explicitly nullable |
| `.unique()` | UNIQUE constraint |
| `.default(value)` | Default value (`'now()'` for timestamps) |
| `.references(table, col)` | Foreign key reference |
| `.onDelete(action)` | ON DELETE action (`'cascade'`, `'set null'`, `'restrict'`, `'no action'`) |
| `.onUpdate(action)` | ON UPDATE action |
| `.index()` | Create an index on this column |
| `.check(expr)` | CHECK constraint expression |

## Example: Blog Schema

```typescript
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
    slug: column.text().notNull().unique(),
    content: column.text().nullable(),
    published: column.boolean().default(false).notNull(),
    authorId: column.integer().notNull().references('user', 'id').onDelete('cascade'),
    createdAt: column.timestamp().default('now()').notNull(),
  }),

  comment: table({
    id: column.serial().primaryKey(),
    content: column.text().notNull(),
    postId: column.integer().notNull().references('post', 'id').onDelete('cascade'),
    authorId: column.integer().notNull().references('user', 'id').onDelete('cascade'),
    createdAt: column.timestamp().default('now()').notNull(),
  }),
});
```
