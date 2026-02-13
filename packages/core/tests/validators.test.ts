import { describe, it, expect } from 'vitest';
import { validateSchema } from '../src/schema/validators.js';
import { defineSchema, table, column } from '../src/schema/dsl.js';

describe('validateSchema()', () => {
    it('returns no errors for a valid schema', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                email: column.text().notNull().unique(),
            }),
        });
        expect(validateSchema(schema)).toEqual([]);
    });

    it('reports missing primary key', () => {
        const schema = defineSchema({
            user: table({
                name: column.text().notNull(),
            }),
        });
        const errors = validateSchema(schema);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('primary key');
    });

    it('reports notNull + nullable conflict', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                name: column.text().notNull().nullable(),
            }),
        });
        const errors = validateSchema(schema);
        const conflict = errors.find((e) => e.column === 'name');
        expect(conflict).toBeDefined();
        expect(conflict!.message).toContain('notNull and nullable');
    });

    it('reports foreign key to unknown table', () => {
        const schema = defineSchema({
            post: table({
                id: column.serial().primaryKey(),
                authorId: column.integer().references('user', 'id'),
            }),
        });
        const errors = validateSchema(schema);
        const fkError = errors.find((e) => e.column === 'authorId');
        expect(fkError).toBeDefined();
        expect(fkError!.message).toContain("unknown table 'user'");
    });

    it('reports foreign key to unknown column', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
            }),
            post: table({
                id: column.serial().primaryKey(),
                authorId: column.integer().references('user', 'uid'),
            }),
        });
        const errors = validateSchema(schema);
        const fkError = errors.find((e) => e.column === 'authorId');
        expect(fkError).toBeDefined();
        expect(fkError!.message).toContain("unknown column 'uid'");
    });

    it('reports onDelete without references', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                val: column.integer().onDelete('cascade'),
            }),
        });
        const errors = validateSchema(schema);
        expect(errors.some((e) => e.message.includes('onDelete'))).toBe(true);
    });

    it('reports invalid varchar length', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                name: column.varchar(0),
            }),
        });
        const errors = validateSchema(schema);
        expect(errors.some((e) => e.message.includes('varchar length'))).toBe(true);
    });

    it('reports decimal scale > precision', () => {
        const schema = defineSchema({
            product: table({
                id: column.serial().primaryKey(),
                price: column.decimal(2, 10),
            }),
        });
        const errors = validateSchema(schema);
        expect(errors.some((e) => e.message.includes('scale cannot exceed'))).toBe(true);
    });

    it('valid schema with foreign keys passes', () => {
        const schema = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
            post: table({
                id: column.serial().primaryKey(),
                authorId: column
                    .integer()
                    .notNull()
                    .references('user', 'id')
                    .onDelete('cascade'),
            }),
        });
        expect(validateSchema(schema)).toEqual([]);
    });
});
