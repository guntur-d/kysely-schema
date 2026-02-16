import { defineSchema, table, column } from 'kysely-schema';

export default defineSchema({
  // Define your tables here. Example:
  //
  // user: table({
  //   id: column.serial().primaryKey(),
  //   email: column.text().notNull().unique(),
  //   name: column.text().nullable(),
  //   createdAt: column.timestamp().default('now()').notNull(),
  // }),
});
