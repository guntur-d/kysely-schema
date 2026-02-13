import { describe, it, expect } from 'vitest';
import { column, table, defineSchema, ColumnBuilder } from '../src/schema/dsl.js';

describe('ColumnBuilder', () => {
    it('creates a serial column', () => {
        const col = column.serial().build();
        expect(col.type).toBe('serial');
    });

    it('chains primaryKey()', () => {
        const col = column.serial().primaryKey().build();
        expect(col.primaryKey).toBe(true);
    });

    it('chains notNull()', () => {
        const col = column.text().notNull().build();
        expect(col.notNull).toBe(true);
    });

    it('chains nullable()', () => {
        const col = column.text().nullable().build();
        expect(col.nullable).toBe(true);
    });

    it('chains unique()', () => {
        const col = column.text().unique().build();
        expect(col.unique).toBe(true);
    });

    it('chains default() with string', () => {
        const col = column.text().default('hello').build();
        expect(col.default).toBe('hello');
    });

    it('chains default() with boolean', () => {
        const col = column.boolean().default(false).build();
        expect(col.default).toBe(false);
    });

    it('chains default() with number', () => {
        const col = column.integer().default(42).build();
        expect(col.default).toBe(42);
    });

    it('chains references()', () => {
        const col = column.integer().references('user', 'id').build();
        expect(col.references).toEqual({ table: 'user', column: 'id' });
    });

    it('chains onDelete() and onUpdate()', () => {
        const col = column
            .integer()
            .references('user', 'id')
            .onDelete('cascade')
            .onUpdate('set null')
            .build();
        expect(col.onDelete).toBe('cascade');
        expect(col.onUpdate).toBe('set null');
    });

    it('chains index()', () => {
        const col = column.integer().index().build();
        expect(col.index).toBe(true);
    });

    it('chains check()', () => {
        const col = column.integer().check('value > 0').build();
        expect(col.check).toBe('value > 0');
    });
});

describe('column factory', () => {
    it.each([
        ['serial', column.serial],
        ['integer', column.integer],
        ['bigint', column.bigint],
        ['text', column.text],
        ['boolean', column.boolean],
        ['timestamp', column.timestamp],
        ['date', column.date],
        ['time', column.time],
        ['json', column.json],
        ['jsonb', column.jsonb],
        ['binary', column.binary],
        ['uuid', column.uuid],
    ] as const)('creates %s column', (type, factory) => {
        const col = factory().build();
        expect(col.type).toBe(type);
    });

    it('creates varchar with length', () => {
        const col = column.varchar(255).build();
        expect(col.type).toBe('varchar');
        expect(col.length).toBe(255);
    });

    it('creates decimal with precision and scale', () => {
        const col = column.decimal(10, 2).build();
        expect(col.type).toBe('decimal');
        expect(col.precision).toBe(10);
        expect(col.scale).toBe(2);
    });
});

describe('table()', () => {
    it('converts ColumnBuilders to ColumnDefinitions', () => {
        const t = table({
            id: column.serial().primaryKey(),
            name: column.text().notNull(),
        });
        expect(t.columns.id.type).toBe('serial');
        expect(t.columns.id.primaryKey).toBe(true);
        expect(t.columns.name.type).toBe('text');
        expect(t.columns.name.notNull).toBe(true);
        expect(t.indexes).toEqual([]);
    });
});

describe('defineSchema()', () => {
    it('wraps tables into a SchemaDefinition', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                email: column.text().notNull().unique(),
            }),
        });
        expect(schema.tables).toBeDefined();
        expect(schema.tables.user).toBeDefined();
        expect(schema.tables.user.columns.id.primaryKey).toBe(true);
        expect(schema.tables.user.columns.email.unique).toBe(true);
    });

    it('supports multiple tables', () => {
        const schema = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
            post: table({ id: column.serial().primaryKey() }),
        });
        expect(Object.keys(schema.tables)).toEqual(['user', 'post']);
    });
});

describe('complex schema', () => {
    it('builds a blog schema with relations', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                email: column.text().notNull().unique(),
                name: column.text().nullable(),
                createdAt: column.timestamp().default('now()').notNull(),
            }),
            post: table({
                id: column.serial().primaryKey(),
                title: column.text().notNull(),
                authorId: column
                    .integer()
                    .notNull()
                    .references('user', 'id')
                    .onDelete('cascade'),
                createdAt: column.timestamp().default('now()').notNull(),
            }),
        });

        const postAuthorId = schema.tables.post.columns.authorId;
        expect(postAuthorId.references).toEqual({ table: 'user', column: 'id' });
        expect(postAuthorId.onDelete).toBe('cascade');
        expect(postAuthorId.notNull).toBe(true);
    });
});
