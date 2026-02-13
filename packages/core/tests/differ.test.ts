import { describe, it, expect } from 'vitest';
import { SchemaDiffer } from '../src/differ/index.js';
import { defineSchema, table, column } from '../src/schema/dsl.js';

describe('SchemaDiffer', () => {
    const differ = new SchemaDiffer();

    it('detects no changes for identical schemas', () => {
        const schema = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
        });
        const ops = differ.diff(schema, schema);
        expect(ops).toEqual([]);
    });

    it('detects added tables', () => {
        const prev = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
        });
        const curr = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
            post: table({ id: column.serial().primaryKey() }),
        });

        const ops = differ.diff(prev, curr);
        expect(ops).toHaveLength(1);
        expect(ops[0].type).toBe('addTable');
        if (ops[0].type === 'addTable') {
            expect(ops[0].tableName).toBe('post');
        }
    });

    it('detects dropped tables', () => {
        const prev = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
            post: table({ id: column.serial().primaryKey() }),
        });
        const curr = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
        });

        const ops = differ.diff(prev, curr);
        expect(ops).toHaveLength(1);
        expect(ops[0].type).toBe('dropTable');
        if (ops[0].type === 'dropTable') {
            expect(ops[0].tableName).toBe('post');
        }
    });

    it('detects added columns', () => {
        const prev = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
        });
        const curr = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                email: column.text().notNull(),
            }),
        });

        const ops = differ.diff(prev, curr);
        expect(ops).toHaveLength(1);
        expect(ops[0].type).toBe('addColumn');
        if (ops[0].type === 'addColumn') {
            expect(ops[0].tableName).toBe('user');
            expect(ops[0].columnName).toBe('email');
        }
    });

    it('detects dropped columns', () => {
        const prev = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                email: column.text().notNull(),
            }),
        });
        const curr = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
        });

        const ops = differ.diff(prev, curr);
        expect(ops).toHaveLength(1);
        expect(ops[0].type).toBe('dropColumn');
        if (ops[0].type === 'dropColumn') {
            expect(ops[0].tableName).toBe('user');
            expect(ops[0].columnName).toBe('email');
        }
    });

    it('detects altered columns', () => {
        const prev = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                name: column.text().notNull(),
            }),
        });
        const curr = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                name: column.varchar(200).notNull(),
            }),
        });

        const ops = differ.diff(prev, curr);
        expect(ops).toHaveLength(1);
        expect(ops[0].type).toBe('alterColumn');
        if (ops[0].type === 'alterColumn') {
            expect(ops[0].tableName).toBe('user');
            expect(ops[0].columnName).toBe('name');
            expect(ops[0].oldColumn.type).toBe('text');
            expect(ops[0].newColumn.type).toBe('varchar');
        }
    });

    it('detects multiple changes at once', () => {
        const prev = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                email: column.text().notNull(),
            }),
            post: table({ id: column.serial().primaryKey() }),
        });
        const curr = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                email: column.varchar(255).notNull(),
                name: column.text().nullable(),
            }),
            comment: table({ id: column.serial().primaryKey() }),
        });

        const ops = differ.diff(prev, curr);
        const types = ops.map((o) => o.type);

        expect(types).toContain('addTable');      // comment
        expect(types).toContain('dropTable');      // post
        expect(types).toContain('addColumn');      // user.name
        expect(types).toContain('alterColumn');    // user.email
    });

    describe('generateAlterMigration()', () => {
        it('generates ALTER TABLE for add column', () => {
            const prev = defineSchema({
                user: table({ id: column.serial().primaryKey() }),
            });
            const curr = defineSchema({
                user: table({
                    id: column.serial().primaryKey(),
                    name: column.text().nullable(),
                }),
            });

            const ops = differ.diff(prev, curr);
            const migration = differ.generateAlterMigration(ops);

            expect(migration.up).toContain("alterTable('user')");
            expect(migration.up).toContain("addColumn('name', 'text')");
            expect(migration.down).toContain("dropColumn('name')");
        });
    });
});
