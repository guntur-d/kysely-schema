import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import chalk from 'chalk';
import { MigrationGenerator } from 'kysely-schema';
import { loadSchema, saveSnapshot } from '../utils/files.js';
import { loadConfig } from '../utils/config.js';

/**
 * `kysely-schema generate-migration <name>` — generate a CREATE TABLE migration.
 */
export async function generateMigrationCommand(name: string): Promise<void> {
    console.log(chalk.cyan(`⚡ Generating migration "${name}"...\n`));

    try {
        const config = await loadConfig();
        const schema = await loadSchema(config.schemaPath);

        const generator = new MigrationGenerator();
        const migration = generator.generate(schema, name);

        const migrationsDir = config.migrationsDir;
        await fs.mkdir(migrationsDir, { recursive: true });

        const migrationPath = path.join(migrationsDir, migration.filename);
        await fs.writeFile(migrationPath, migration.content);

        // Save a snapshot of the current schema
        await saveSnapshot(config.snapshotDir, schema);

        console.log(chalk.green('  ✔'), `Migration generated: ${migrationPath}`);
        console.log(chalk.dim('\nNext steps:'));
        console.log(chalk.dim(`  1. Review the migration: ${migrationPath}`));
        console.log(chalk.dim('  2. Run: npx kysely migrate:latest'));
    } catch (error) {
        console.error(chalk.red('✖ Failed to generate migration:'), error);
        process.exit(1);
    }
}
