import type { DiffOperation } from '../schema/types.js';

// Re-export the operation types for convenience
export type {
    DiffOperation,
    AddTableOperation,
    DropTableOperation,
    AddColumnOperation,
    DropColumnOperation,
    AlterColumnOperation,
    AddIndexOperation,
    DropIndexOperation,
} from '../schema/types.js';

/**
 * Labels used when printing diffs to the console.
 */
export const operationLabels: Record<DiffOperation['type'], string> = {
    addTable: '+ ADD TABLE',
    dropTable: '- DROP TABLE',
    addColumn: '+ ADD COLUMN',
    dropColumn: '- DROP COLUMN',
    alterColumn: '~ ALTER COLUMN',
    addIndex: '+ ADD INDEX',
    dropIndex: '- DROP INDEX',
};

/**
 * Return a human-readable summary for a diff operation.
 */
export function describeOperation(op: DiffOperation): string {
    return `${operationLabels[op.type]}: ${op.description}`;
}
