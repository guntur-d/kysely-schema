import { describe, it, expect } from 'vitest';
import { MigrationGenerator } from '../src/generators/migration.js';
import { defineSchema, table, column } from '../src/schema/dsl.js';

describe('MigrationGenerator', () => {
    const generator = new MigrationGenerator();

    it('generates a valid migration filename', () => {
        const schema = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
        });
        const migration = generator.generate(schema, 'create_users');
        expect(migration.filename).toMatch(/^\d{8}T\d{6}_create_users\.ts$/);
    });

    it('generates CREATE TABLE with addColumn', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                email: column.text().notNull().unique(),
            }),
        });

        const migration = generator.generate(schema, 'initial');
        expect(migration.content).toContain("createTable('user')");
        expect(migration.content).toContain("addColumn('id', 'serial'");
        expect(migration.content).toContain("addColumn('email', 'text'");
        expect(migration.content).toContain('primaryKey()');
        expect(migration.content).toContain('notNull()');
        expect(migration.content).toContain('unique()');
    });

    it('generates default values', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                active: column.boolean().default(false).notNull(),
                createdAt: column.timestamp().default('now()').notNull(),
            }),
        });

        const migration = generator.generate(schema, 'defaults');
        expect(migration.content).toContain('defaultTo(false)');
        expect(migration.content).toContain('defaultTo(sql`now()`)');
    });

    it('generates foreign key constraints', () => {
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

        const migration = generator.generate(schema, 'with_fk');
        expect(migration.content).toContain("references('user.id')");
        expect(migration.content).toContain("onDelete('cascade')");
    });

    it('generates indexes for foreign keys', () => {
        const schema = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
            post: table({
                id: column.serial().primaryKey(),
                authorId: column.integer().references('user', 'id'),
            }),
        });

        const migration = generator.generate(schema, 'fk_indexes');
        expect(migration.content).toContain("createIndex('post_authorId_index')");
        expect(migration.content).toContain(".on('post')");
        expect(migration.content).toContain(".column('authorId')");
    });

    it('generates DROP TABLE in reverse order for down()', () => {
        const schema = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
            post: table({ id: column.serial().primaryKey() }),
            comment: table({ id: column.serial().primaryKey() }),
        });

        const migration = generator.generate(schema, 'reverse_drop');
        const downSection = migration.content.split('export async function down')[1];
        const userIdx = downSection.indexOf("dropTable('user')");
        const postIdx = downSection.indexOf("dropTable('post')");
        const commentIdx = downSection.indexOf("dropTable('comment')");

        // comment should be dropped first, then post, then user
        expect(commentIdx).toBeLessThan(postIdx);
        expect(postIdx).toBeLessThan(userIdx);
    });

    it('generates varchar with length', () => {
        const schema = defineSchema({
            user: table({
                id: column.serial().primaryKey(),
                name: column.varchar(100).notNull(),
            }),
        });

        const migration = generator.generate(schema, 'varchar');
        expect(migration.content).toContain("addColumn('name', 'varchar(100)'");
    });

    it('generates decimal with precision and scale', () => {
        const schema = defineSchema({
            product: table({
                id: column.serial().primaryKey(),
                price: column.decimal(10, 2).notNull(),
            }),
        });

        const migration = generator.generate(schema, 'decimal');
        expect(migration.content).toContain("addColumn('price', 'decimal(10, 2)'");
    });

    it('imports Kysely and sql', () => {
        const schema = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
        });

        const migration = generator.generate(schema, 'imports');
        expect(migration.content).toContain("import { Kysely, sql } from 'kysely'");
    });

    it('generates up and down functions', () => {
        const schema = defineSchema({
            user: table({ id: column.serial().primaryKey() }),
        });

        const migration = generator.generate(schema, 'up_down');
        expect(migration.content).toContain('export async function up');
        expect(migration.content).toContain('export async function down');
    });
});
