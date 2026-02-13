import { defineSchema, table, column } from 'kysely-schema';

export default defineSchema({
    user: table({
        id: column.serial().primaryKey(),
        email: column.text().notNull().unique(),
        name: column.text().nullable(),
        createdAt: column.timestamp().default('now()').notNull(),
        updatedAt: column.timestamp().default('now()').notNull(),
    }),
});
