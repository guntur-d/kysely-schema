// ─── Public API for kysely-schema ────────────────────────────────────────────

// Schema DSL
export { column, table, defineSchema, ColumnBuilder } from './schema/dsl.js';

// Schema types
export type {
    ColumnDefinition,
    ColumnType,
    ReferentialAction,
    ForeignKeyReference,
    IndexDefinition,
    TableDefinition,
    SchemaDefinition,
    MigrationFile,
    DiffOperation,
    DiffOperationType,
    AddTableOperation,
    DropTableOperation,
    AddColumnOperation,
    DropColumnOperation,
    AlterColumnOperation,
    AddIndexOperation,
    DropIndexOperation,
    SchemaSnapshot,
    KyselySchemaConfig,
} from './schema/types.js';

// Validators
export { validateSchema } from './schema/validators.js';
export type { ValidationError } from './schema/validators.js';

// Generators
export { MigrationGenerator } from './generators/migration.js';
export { TypeGenerator } from './generators/types.js';
export { schemaTemplate, configTemplate } from './generators/templates.js';

// Differ
export { SchemaDiffer } from './differ/index.js';
export { operationLabels, describeOperation } from './differ/operations.js';
