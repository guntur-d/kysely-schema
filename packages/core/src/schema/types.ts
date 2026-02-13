// ─── Referential Actions ───────────────────────────────────────────────────────

export type ReferentialAction = 'cascade' | 'set null' | 'restrict' | 'no action';

// ─── Column Types ──────────────────────────────────────────────────────────────

export type ColumnType =
    | 'serial'
    | 'integer'
    | 'bigint'
    | 'decimal'
    | 'text'
    | 'varchar'
    | 'timestamp'
    | 'date'
    | 'time'
    | 'boolean'
    | 'json'
    | 'jsonb'
    | 'binary'
    | 'uuid';

// ─── Column Definition ────────────────────────────────────────────────────────

export interface ForeignKeyReference {
    table: string;
    column: string;
}

export interface ColumnDefinition {
    type: ColumnType;
    primaryKey?: boolean;
    notNull?: boolean;
    nullable?: boolean;
    unique?: boolean;
    default?: string | number | boolean;
    references?: ForeignKeyReference;
    onDelete?: ReferentialAction;
    onUpdate?: ReferentialAction;
    index?: boolean;
    check?: string;
    length?: number;
    precision?: number;
    scale?: number;
}

// ─── Table Definition ─────────────────────────────────────────────────────────

export interface IndexDefinition {
    name?: string;
    columns: string[];
    unique?: boolean;
}

export interface TableDefinition {
    columns: Record<string, ColumnDefinition>;
    indexes: IndexDefinition[];
    checks?: string[];
}

// ─── Schema Definition ────────────────────────────────────────────────────────

export interface SchemaDefinition {
    tables: Record<string, TableDefinition>;
}

// ─── Migration File ───────────────────────────────────────────────────────────

export interface MigrationFile {
    filename: string;
    content: string;
}

// ─── Diff Operations ──────────────────────────────────────────────────────────

export type DiffOperationType =
    | 'addTable'
    | 'dropTable'
    | 'addColumn'
    | 'dropColumn'
    | 'alterColumn'
    | 'addIndex'
    | 'dropIndex';

export interface BaseDiffOperation {
    type: DiffOperationType;
    description: string;
}

export interface AddTableOperation extends BaseDiffOperation {
    type: 'addTable';
    tableName: string;
    table: TableDefinition;
}

export interface DropTableOperation extends BaseDiffOperation {
    type: 'dropTable';
    tableName: string;
}

export interface AddColumnOperation extends BaseDiffOperation {
    type: 'addColumn';
    tableName: string;
    columnName: string;
    column: ColumnDefinition;
}

export interface DropColumnOperation extends BaseDiffOperation {
    type: 'dropColumn';
    tableName: string;
    columnName: string;
}

export interface AlterColumnOperation extends BaseDiffOperation {
    type: 'alterColumn';
    tableName: string;
    columnName: string;
    oldColumn: ColumnDefinition;
    newColumn: ColumnDefinition;
}

export interface AddIndexOperation extends BaseDiffOperation {
    type: 'addIndex';
    tableName: string;
    index: IndexDefinition;
}

export interface DropIndexOperation extends BaseDiffOperation {
    type: 'dropIndex';
    tableName: string;
    indexName: string;
}

export type DiffOperation =
    | AddTableOperation
    | DropTableOperation
    | AddColumnOperation
    | DropColumnOperation
    | AlterColumnOperation
    | AddIndexOperation
    | DropIndexOperation;

// ─── Schema Snapshot (used by differ) ─────────────────────────────────────────

export interface SchemaSnapshot {
    version: string;
    timestamp: string;
    schema: SchemaDefinition;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface KyselySchemaConfig {
    schemaPath: string;
    migrationsDir: string;
    generatedDir: string;
    snapshotDir: string;
}
