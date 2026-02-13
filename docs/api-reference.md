# API Reference

## Schema DSL

### `defineSchema(tables)`

Creates a schema definition from a map of table names to table definitions.

```typescript
const schema = defineSchema({
  user: table({ ... }),
  post: table({ ... }),
});
```

### `table(columns)`

Creates a table definition from a map of column names to column builders.

```typescript
const userTable = table({
  id: column.serial().primaryKey(),
  email: column.text().notNull(),
});
```

### `column`

Factory object for creating typed column builders.

| Method | Returns |
|--------|---------|
| `column.serial()` | `ColumnBuilder` |
| `column.integer()` | `ColumnBuilder` |
| `column.bigint()` | `ColumnBuilder` |
| `column.decimal(precision?, scale?)` | `ColumnBuilder` |
| `column.text()` | `ColumnBuilder` |
| `column.varchar(length?)` | `ColumnBuilder` |
| `column.timestamp()` | `ColumnBuilder` |
| `column.date()` | `ColumnBuilder` |
| `column.time()` | `ColumnBuilder` |
| `column.boolean()` | `ColumnBuilder` |
| `column.json()` | `ColumnBuilder` |
| `column.jsonb()` | `ColumnBuilder` |
| `column.binary()` | `ColumnBuilder` |
| `column.uuid()` | `ColumnBuilder` |

### `ColumnBuilder`

Fluent API for configuring columns. All methods return `this` for chaining.

| Method | Description |
|--------|-------------|
| `.primaryKey()` | Mark as primary key |
| `.notNull()` | Add NOT NULL constraint |
| `.nullable()` | Mark as nullable |
| `.unique()` | Add UNIQUE constraint |
| `.default(value)` | Set default value |
| `.references(table, column)` | Add foreign key |
| `.onDelete(action)` | Set ON DELETE action |
| `.onUpdate(action)` | Set ON UPDATE action |
| `.index()` | Generate an index |
| `.check(expression)` | Add CHECK constraint |
| `.build()` | Return the raw `ColumnDefinition` |

---

## Generators

### `MigrationGenerator`

```typescript
const generator = new MigrationGenerator();
const migration = generator.generate(schema, 'migration_name');
// migration.filename → '20240115T120000_migration_name.ts'
// migration.content  → full migration file string
```

### `TypeGenerator`

```typescript
const generator = new TypeGenerator();
const types = generator.generate(schema);
// types → TypeScript source with Database interface
```

---

## Differ

### `SchemaDiffer`

```typescript
const differ = new SchemaDiffer();
const ops = differ.diff(previousSchema, currentSchema);
// ops → DiffOperation[]

const migration = differ.generateAlterMigration(ops);
// migration.up   → ALTER TABLE code
// migration.down → reverse ALTER TABLE code
```

---

## Validators

### `validateSchema(schema)`

Returns an array of `ValidationError` objects. Empty array = valid schema.

```typescript
const errors = validateSchema(schema);
// errors → [{ table, column?, message }]
```
