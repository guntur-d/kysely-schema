import type { KyselySchemaConfig } from 'kysely-schema';

const config: KyselySchemaConfig = {
  schemaPath: './schema/index.ts',
  migrationsDir: './migrations',
  generatedDir: './generated',
  snapshotDir: './.kysely-schema',
};

export default config;
