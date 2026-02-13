import chalk from 'chalk';
import { SchemaDiffer, describeOperation } from 'kysely-schema';
import { loadSchema, loadLatestSnapshot } from '../utils/files.js';
import { loadConfig } from '../utils/config.js';

/**
 * `kysely-schema diff` — show schema changes since last migration.
 */
export async function diffCommand(): Promise<void> {
    console.log(chalk.cyan('⚡ Analyzing schema changes...\n'));

    try {
        const config = await loadConfig();
        const currentSchema = await loadSchema(config.schemaPath);
        const previousSchema = await loadLatestSnapshot(config.snapshotDir);

        if (!previousSchema) {
            console.log(
                chalk.yellow('⚠'),
                'No previous snapshot found. Run generate-migration first.',
            );
            return;
        }

        const differ = new SchemaDiffer();
        const changes = differ.diff(previousSchema, currentSchema);

        if (changes.length === 0) {
            console.log(chalk.green('✨ No schema changes detected.'));
            return;
        }

        console.log(chalk.white(`📋 Detected ${changes.length} change(s):\n`));
        for (const change of changes) {
            console.log(`  ${describeOperation(change)}`);
        }

        console.log(chalk.dim('\nRun generate-migration to create a migration for these changes.'));
    } catch (error) {
        console.error(chalk.red('✖ Failed to analyze schema:'), error);
        process.exit(1);
    }
}
