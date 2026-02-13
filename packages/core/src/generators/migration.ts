import type {
    SchemaDefinition,
    MigrationFile,
    ColumnDefinition,
    TableDefinition,
} from '../schema/types.js';

/**
 * Generates Kysely migration files from a SchemaDefinition.
 */
export class MigrationGenerator {
    /**
     * Generate a full CREATE-TABLE migration for the entire schema.
     */
    generate(schema: SchemaDefinition, migrationName: string): MigrationFile {
        const timestamp = this.generateTimestamp();
        const filename = `${timestamp}_${this.sanitize(migrationName)}.ts`;

        const upCode = this.generateUpFunction(schema);
        const downCode = this.generateDownFunction(schema);

        const content = [
            `import { Kysely, sql } from 'kysely';`,
            ``,
            `export async function up(db: Kysely<any>): Promise<void> {`,
            upCode,
            `}`,
            ``,
            `export async function down(db: Kysely<any>): Promise<void> {`,
            downCode,
            `}`,
            ``,
        ].join('\n');

        return { filename, content };
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private generateUpFunction(schema: SchemaDefinition): string {
        const parts: string[] = [];

        for (const [tableName, tableDef] of Object.entries(schema.tables)) {
            parts.push(this.generateCreateTable(tableName, tableDef));
            const indexes = this.generateIndexes(tableName, tableDef);
            if (indexes) parts.push(indexes);
        }

        return parts.join('\n');
    }

    private generateCreateTable(name: string, def: TableDefinition): string {
        const lines: string[] = [];
        lines.push(`  await db.schema`);
        lines.push(`    .createTable('${name}')`);

        for (const [colName, colDef] of Object.entries(def.columns)) {
            lines.push(this.generateColumnDefinition(colName, colDef));
        }

        lines.push(`    .execute();`);
        return lines.join('\n');
    }

    private generateColumnDefinition(name: string, def: ColumnDefinition): string {
        const type = this.mapColumnType(def);
        const modifiers = this.buildModifiers(def);

        if (modifiers.length > 0) {
            return `    .addColumn('${name}', '${type}', (col) => col.${modifiers.join('.')})`;
        }
        return `    .addColumn('${name}', '${type}')`;
    }

    private buildModifiers(def: ColumnDefinition): string[] {
        const mods: string[] = [];

        if (def.primaryKey) mods.push('primaryKey()');
        if (def.notNull) mods.push('notNull()');
        if (def.unique) mods.push('unique()');

        if (def.default !== undefined) {
            mods.push(`defaultTo(${this.formatDefaultValue(def.default, def.type)})`);
        }

        if (def.references) {
            mods.push(`references('${def.references.table}.${def.references.column}')`);
            if (def.onDelete) mods.push(`onDelete('${def.onDelete}')`);
            if (def.onUpdate) mods.push(`onUpdate('${def.onUpdate}')`);
        }

        if (def.check) {
            mods.push(`check(sql\`${def.check}\`)`);
        }

        return mods;
    }

    private generateDownFunction(schema: SchemaDefinition): string {
        const tables = Object.keys(schema.tables).reverse();
        return tables
            .map((t) => `  await db.schema.dropTable('${t}').ifExists().execute();`)
            .join('\n');
    }

    private generateIndexes(tableName: string, tableDef: TableDefinition): string {
        const lines: string[] = [];

        // Auto-generate indexes for indexed columns and foreign keys
        for (const [colName, colDef] of Object.entries(tableDef.columns)) {
            if (colDef.index || colDef.references) {
                lines.push(`  await db.schema`);
                lines.push(`    .createIndex('${tableName}_${colName}_index')`);
                lines.push(`    .on('${tableName}')`);
                lines.push(`    .column('${colName}')`);
                lines.push(`    .execute();`);
            }
        }

        // Explicit indexes
        for (const idx of tableDef.indexes) {
            const idxName = idx.name || `${tableName}_${idx.columns.join('_')}_index`;
            lines.push(`  await db.schema`);
            if (idx.unique) {
                lines.push(`    .createIndex('${idxName}')`);
                lines.push(`    .on('${tableName}')`);
                lines.push(`    .columns([${idx.columns.map((c) => `'${c}'`).join(', ')}])`);
                lines.push(`    .unique()`);
            } else {
                lines.push(`    .createIndex('${idxName}')`);
                lines.push(`    .on('${tableName}')`);
                lines.push(`    .columns([${idx.columns.map((c) => `'${c}'`).join(', ')}])`);
            }
            lines.push(`    .execute();`);
        }

        return lines.length > 0 ? lines.join('\n') : '';
    }

    private mapColumnType(def: ColumnDefinition): string {
        switch (def.type) {
            case 'varchar':
                return def.length ? `varchar(${def.length})` : 'varchar';
            case 'decimal':
                if (def.precision !== undefined && def.scale !== undefined) {
                    return `decimal(${def.precision}, ${def.scale})`;
                }
                return 'decimal';
            default:
                return def.type;
        }
    }

    private formatDefaultValue(value: string | number | boolean, _type: string): string {
        if (typeof value === 'string' && value === 'now()') return 'sql`now()`';
        if (typeof value === 'string') return `'${value}'`;
        if (typeof value === 'boolean') return value.toString();
        return String(value);
    }

    private generateTimestamp(): string {
        const now = new Date();
        return now
            .toISOString()
            .replace(/[-:]/g, '')
            .split('.')[0];
    }

    private sanitize(name: string): string {
        return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    }
}
