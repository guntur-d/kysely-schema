import { defineSchema, table, column } from 'kysely-schema';

export default defineSchema({
    user: table({
        id: column.serial().primaryKey(),
        email: column.text().notNull().unique(),
        name: column.text().nullable(),
        passwordHash: column.text().notNull(),
        createdAt: column.timestamp().default('now()').notNull(),
        updatedAt: column.timestamp().default('now()').notNull(),
    }),

    post: table({
        id: column.serial().primaryKey(),
        title: column.text().notNull(),
        slug: column.text().notNull().unique(),
        content: column.text().nullable(),
        published: column.boolean().default(false).notNull(),
        authorId: column.integer().notNull().references('user', 'id').onDelete('cascade'),
        publishedAt: column.timestamp().nullable(),
        createdAt: column.timestamp().default('now()').notNull(),
        updatedAt: column.timestamp().default('now()').notNull(),
    }),

    comment: table({
        id: column.serial().primaryKey(),
        content: column.text().notNull(),
        postId: column.integer().notNull().references('post', 'id').onDelete('cascade'),
        authorId: column.integer().notNull().references('user', 'id').onDelete('cascade'),
        createdAt: column.timestamp().default('now()').notNull(),
    }),
});
