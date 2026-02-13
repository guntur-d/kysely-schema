import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { KyselySchemaConfig } from 'kysely-schema';

const DEFAULT_CONFIG: KyselySchemaConfig = {
    schemaPath: './schema/index.ts',
    migrationsDir: './migrations',
    generatedDir: './generated',
    snapshotDir: './.kysely-schema',
};

/**
 * Load the project config from `kysely-schema.config.ts` (or fall back to defaults).
 */
export async function loadConfig(): Promise<KyselySchemaConfig> {
    const configPath = path.resolve('kysely-schema.config.ts');

    try {
        await fs.access(configPath);
        const mod = await import(configPath);
        return { ...DEFAULT_CONFIG, ...(mod.default ?? mod) };
    } catch {
        // No config file — use defaults
        return DEFAULT_CONFIG;
    }
}
