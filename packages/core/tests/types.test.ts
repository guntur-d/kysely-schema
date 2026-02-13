import { describe, it, expect } from 'vitest';
import { TypeGenerator } from '../src/generators/types.js';
import { defineSchema, table, column } from '../src/schema/dsl.js';

describe('TypeGenerator', () => {
    const generator = new TypeGenerator();

    it('generates a Database interface', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                email: column.text().notNull(),
            }),
        });

        const output = generator.generate(schema);
        expect(output).toContain('export interface Database');
        expect(output).toContain('user: UserTable');
    });

    it('generates per-table interfaces', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                name: column.text().notNull(),
            }),
        });

        const output = generator.generate(schema);
        expect(output).toContain('export interface UserTable');
        expect(output).toContain('id: Generated<number>');
        expect(output).toContain('name: string');
    });

    it('maps serial to Generated<number>', () => {
        const schema = defineSchema({
            t: table({ id: column.serial().primaryKey() }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('id: Generated<number>');
    });

    it('maps integer to number', () => {
        const schema = defineSchema({
            t: table({
                id: column.serial().primaryKey(),
                count: column.integer().notNull(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('count: number');
    });

    it('maps bigint to string', () => {
        const schema = defineSchema({
            t: table({
                id: column.serial().primaryKey(),
                big: column.bigint().notNull(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('big: string');
    });

    it('maps text and varchar to string', () => {
        const schema = defineSchema({
            t: table({
                id: column.serial().primaryKey(),
                a: column.text().notNull(),
                b: column.varchar(100).notNull(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('a: string');
        expect(output).toContain('b: string');
    });

    it('maps timestamp and date to Date', () => {
        const schema = defineSchema({
            t: table({
                id: column.serial().primaryKey(),
                ts: column.timestamp().notNull(),
                d: column.date().notNull(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('ts: Date');
        expect(output).toContain('d: Date');
    });

    it('maps boolean to boolean', () => {
        const schema = defineSchema({
            t: table({
                id: column.serial().primaryKey(),
                active: column.boolean().notNull(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('active: boolean');
    });

    it('maps json/jsonb to unknown', () => {
        const schema = defineSchema({
            t: table({
                id: column.serial().primaryKey(),
                data: column.json().notNull(),
                meta: column.jsonb().notNull(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('data: unknown');
        expect(output).toContain('meta: unknown');
    });

    it('maps uuid to string', () => {
        const schema = defineSchema({
            t: table({
                id: column.serial().primaryKey(),
                uid: column.uuid().notNull(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('uid: string');
    });

    it('marks nullable columns with | null', () => {
        const schema = defineSchema({
            t: table({
                id: column.serial().primaryKey(),
                bio: column.text().nullable(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('bio: string | null');
    });

    it('wraps columns with default in Generated<>', () => {
        const schema = defineSchema({
            t: table({
                id: column.serial().primaryKey(),
                active: column.boolean().default(true).notNull(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('active: Generated<boolean>');
    });

    it('includes auto-generated header comment', () => {
        const schema = defineSchema({
            t: table({ id: column.serial().primaryKey() }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('Auto-generated by kysely-schema');
        expect(output).toContain('DO NOT EDIT');
    });

    it('imports Generated and ColumnType from kysely', () => {
        const schema = defineSchema({
            t: table({ id: column.serial().primaryKey() }),
        });
        const output = generator.generate(schema);
        expect(output).toContain("from 'kysely'");
    });

    it('handles PascalCase conversion for multi-word table names', () => {
        const schema = defineSchema({
            user_profile: table({
                id: column.serial().primaryKey(),
                displayName: column.text().notNull(),
            }),
        });
        const output = generator.generate(schema);
        expect(output).toContain('export interface UserProfileTable');
        expect(output).toContain('user_profile: UserProfileTable');
    });
});
