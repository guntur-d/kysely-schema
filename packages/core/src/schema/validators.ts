import type { SchemaDefinition } from './types.js';

export interface ValidationError {
    table: string;
    column?: string;
    message: string;
}

/**
 * Validate a schema definition and return a list of problems.
 * Returns an empty array if the schema is valid.
 */
export function validateSchema(schema: SchemaDefinition): ValidationError[] {
    const errors: ValidationError[] = [];
    const tableNames = Object.keys(schema.tables);

    for (const [tableName, tableDef] of Object.entries(schema.tables)) {
        const columnNames = Object.keys(tableDef.columns);

        // ── check: table must have at least one column ──
        if (columnNames.length === 0) {
            errors.push({
                table: tableName,
                message: 'Table has no columns defined.',
            });
        }

        // ── check: at least one primary key ──
        const pks = columnNames.filter((c) => tableDef.columns[c].primaryKey);
        if (pks.length === 0) {
            errors.push({
                table: tableName,
                message: 'Table has no primary key defined.',
            });
        }

        for (const [colName, colDef] of Object.entries(tableDef.columns)) {
            // ── check: notNull + nullable conflict ──
            if (colDef.notNull && colDef.nullable) {
                errors.push({
                    table: tableName,
                    column: colName,
                    message: 'Column cannot be both notNull and nullable.',
                });
            }

            // ── check: foreign key target exists ──
            if (colDef.references) {
                if (!tableNames.includes(colDef.references.table)) {
                    errors.push({
                        table: tableName,
                        column: colName,
                        message: `Foreign key references unknown table '${colDef.references.table}'.`,
                    });
                } else {
                    const targetTable = schema.tables[colDef.references.table];
                    if (
                        targetTable &&
                        !Object.keys(targetTable.columns).includes(colDef.references.column)
                    ) {
                        errors.push({
                            table: tableName,
                            column: colName,
                            message: `Foreign key references unknown column '${colDef.references.column}' in table '${colDef.references.table}'.`,
                        });
                    }
                }
            }

            // ── check: onDelete / onUpdate without references ──
            if ((colDef.onDelete || colDef.onUpdate) && !colDef.references) {
                errors.push({
                    table: tableName,
                    column: colName,
                    message: 'onDelete/onUpdate specified without a foreign key reference.',
                });
            }

            // ── check: varchar length ──
            if (colDef.type === 'varchar' && colDef.length !== undefined && colDef.length <= 0) {
                errors.push({
                    table: tableName,
                    column: colName,
                    message: 'varchar length must be a positive number.',
                });
            }

            // ── check: decimal precision/scale ──
            if (colDef.type === 'decimal') {
                if (colDef.precision !== undefined && colDef.precision <= 0) {
                    errors.push({
                        table: tableName,
                        column: colName,
                        message: 'decimal precision must be a positive number.',
                    });
                }
                if (
                    colDef.scale !== undefined &&
                    colDef.precision !== undefined &&
                    colDef.scale > colDef.precision
                ) {
                    errors.push({
                        table: tableName,
                        column: colName,
                        message: 'decimal scale cannot exceed precision.',
                    });
                }
            }
        }
    }

    return errors;
}
