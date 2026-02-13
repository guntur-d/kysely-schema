// ─── Code templates used by the CLI ────────────────────────────────────────

/**
 * Default schema template written by `kysely-schema init`.
 */
export const schemaTemplate = `import { defineSchema, table, column } from 'kysely-schema';

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
`;

/**
 * Default config file template.
 */
export const configTemplate = `import type { KyselySchemaConfig } from 'kysely-schema';

const config: KyselySchemaConfig = {
  schemaPath: './schema/index.ts',
  migrationsDir: './migrations',
  generatedDir: './generated',
  snapshotDir: './.kysely-schema',
};

export default config;
`;
