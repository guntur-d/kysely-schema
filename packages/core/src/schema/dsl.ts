import type {
    ColumnDefinition,
    ColumnType,
    ReferentialAction,
    TableDefinition,
    SchemaDefinition,
} from './types.js';

// ─── ColumnBuilder ────────────────────────────────────────────────────────────

export class ColumnBuilder {
    private def: ColumnDefinition;

    constructor(init: Partial<ColumnDefinition> & { type: ColumnType }) {
        this.def = { ...init } as ColumnDefinition;
    }

    primaryKey(): this {
        this.def.primaryKey = true;
        return this;
    }

    notNull(): this {
        this.def.notNull = true;
        return this;
    }

    nullable(): this {
        this.def.nullable = true;
        return this;
    }

    unique(): this {
        this.def.unique = true;
        return this;
    }

    default(value: string | number | boolean): this {
        this.def.default = value;
        return this;
    }

    references(table: string, col: string): this {
        this.def.references = { table, column: col };
        return this;
    }

    onDelete(action: ReferentialAction): this {
        this.def.onDelete = action;
        return this;
    }

    onUpdate(action: ReferentialAction): this {
        this.def.onUpdate = action;
        return this;
    }

    index(): this {
        this.def.index = true;
        return this;
    }

    check(expression: string): this {
        this.def.check = expression;
        return this;
    }

    /** @internal Return the raw column definition. */
    build(): ColumnDefinition {
        return { ...this.def };
    }
}

// ─── Column factory ──────────────────────────────────────────────────────────

export const column = {
    // Numeric types
    serial: () => new ColumnBuilder({ type: 'serial' }),
    integer: () => new ColumnBuilder({ type: 'integer' }),
    bigint: () => new ColumnBuilder({ type: 'bigint' }),
    decimal: (precision?: number, scale?: number) =>
        new ColumnBuilder({ type: 'decimal', precision, scale }),

    // Text types
    text: () => new ColumnBuilder({ type: 'text' }),
    varchar: (length?: number) => new ColumnBuilder({ type: 'varchar', length }),

    // Date / Time types
    timestamp: () => new ColumnBuilder({ type: 'timestamp' }),
    date: () => new ColumnBuilder({ type: 'date' }),
    time: () => new ColumnBuilder({ type: 'time' }),

    // Boolean
    boolean: () => new ColumnBuilder({ type: 'boolean' }),

    // JSON
    json: () => new ColumnBuilder({ type: 'json' }),
    jsonb: () => new ColumnBuilder({ type: 'jsonb' }),

    // Binary
    binary: () => new ColumnBuilder({ type: 'binary' }),

    // UUID
    uuid: () => new ColumnBuilder({ type: 'uuid' }),
};

// ─── Table helper ─────────────────────────────────────────────────────────────

export function table(
    columns: Record<string, ColumnBuilder>,
): TableDefinition {
    const built: Record<string, ColumnDefinition> = {};
    for (const [name, builder] of Object.entries(columns)) {
        built[name] = builder.build();
    }
    return { columns: built, indexes: [] };
}

// ─── defineSchema ─────────────────────────────────────────────────────────────

export function defineSchema(
    tables: Record<string, TableDefinition>,
): SchemaDefinition {
    return { tables };
}
