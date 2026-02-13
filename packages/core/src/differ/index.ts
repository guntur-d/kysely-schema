import type {
    SchemaDefinition,
    DiffOperation,
    ColumnDefinition,
} from '../schema/types.js';

/**
 * Compares two schema snapshots and returns a list of diff operations
 * needed to migrate from `previous` to `current`.
 */
export class SchemaDiffer {
    diff(previous: SchemaDefinition, current: SchemaDefinition): DiffOperation[] {
        const ops: DiffOperation[] = [];

        const prevTables = new Set(Object.keys(previous.tables));
        const currTables = new Set(Object.keys(current.tables));

        // ── Added tables ──
        for (const tableName of currTables) {
            if (!prevTables.has(tableName)) {
                ops.push({
                    type: 'addTable',
                    tableName,
                    table: current.tables[tableName],
                    description: `Create table '${tableName}'`,
                });
            }
        }

        // ── Dropped tables ──
        for (const tableName of prevTables) {
            if (!currTables.has(tableName)) {
                ops.push({
                    type: 'dropTable',
                    tableName,
                    description: `Drop table '${tableName}'`,
                });
            }
        }

        // ── Changed tables (columns) ──
        for (const tableName of currTables) {
            if (!prevTables.has(tableName)) continue; // already handled as addTable

            const prevCols = previous.tables[tableName].columns;
            const currCols = current.tables[tableName].columns;
            const prevColNames = new Set(Object.keys(prevCols));
            const currColNames = new Set(Object.keys(currCols));

            // Added columns
            for (const colName of currColNames) {
                if (!prevColNames.has(colName)) {
                    ops.push({
                        type: 'addColumn',
                        tableName,
                        columnName: colName,
                        column: currCols[colName],
                        description: `Add column '${colName}' to table '${tableName}'`,
                    });
                }
            }

            // Dropped columns
            for (const colName of prevColNames) {
                if (!currColNames.has(colName)) {
                    ops.push({
                        type: 'dropColumn',
                        tableName,
                        columnName: colName,
                        description: `Drop column '${colName}' from table '${tableName}'`,
                    });
                }
            }

            // Altered columns
            for (const colName of currColNames) {
                if (!prevColNames.has(colName)) continue;
                if (!this.columnsEqual(prevCols[colName], currCols[colName])) {
                    ops.push({
                        type: 'alterColumn',
                        tableName,
                        columnName: colName,
                        oldColumn: prevCols[colName],
                        newColumn: currCols[colName],
                        description: `Alter column '${colName}' in table '${tableName}'`,
                    });
                }
            }
        }

        return ops;
    }

    /**
     * Generate an ALTER-TABLE migration string from a list of diff operations.
     */
    generateAlterMigration(ops: DiffOperation[]): { up: string; down: string } {
        const upLines: string[] = [];
        const downLines: string[] = [];

        for (const op of ops) {
            switch (op.type) {
                case 'addTable': {
                    upLines.push(`  await db.schema`);
                    upLines.push(`    .createTable('${op.tableName}')`);
                    for (const [colName, colDef] of Object.entries(op.table.columns)) {
                        upLines.push(`    .addColumn('${colName}', '${colDef.type}')`);
                    }
                    upLines.push(`    .execute();`);
                    downLines.push(`  await db.schema.dropTable('${op.tableName}').ifExists().execute();`);
                    break;
                }
                case 'dropTable': {
                    upLines.push(`  await db.schema.dropTable('${op.tableName}').ifExists().execute();`);
                    // down: cannot fully reverse without the old definition
                    downLines.push(`  // TODO: Recreate table '${op.tableName}'`);
                    break;
                }
                case 'addColumn': {
                    upLines.push(`  await db.schema.alterTable('${op.tableName}').addColumn('${op.columnName}', '${op.column.type}').execute();`);
                    downLines.push(`  await db.schema.alterTable('${op.tableName}').dropColumn('${op.columnName}').execute();`);
                    break;
                }
                case 'dropColumn': {
                    upLines.push(`  await db.schema.alterTable('${op.tableName}').dropColumn('${op.columnName}').execute();`);
                    downLines.push(`  // TODO: Re-add column '${op.columnName}' to '${op.tableName}'`);
                    break;
                }
                case 'alterColumn': {
                    upLines.push(`  await db.schema.alterTable('${op.tableName}').alterColumn('${op.columnName}', (col) => col.setDataType('${op.newColumn.type}')).execute();`);
                    downLines.push(`  await db.schema.alterTable('${op.tableName}').alterColumn('${op.columnName}', (col) => col.setDataType('${op.oldColumn.type}')).execute();`);
                    break;
                }
                default:
                    break;
            }
        }

        return {
            up: upLines.join('\n'),
            down: downLines.join('\n'),
        };
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private columnsEqual(a: ColumnDefinition, b: ColumnDefinition): boolean {
        return JSON.stringify(a) === JSON.stringify(b);
    }
}
