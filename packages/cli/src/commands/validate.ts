import chalk from 'chalk';
import { validateSchema } from 'kysely-schema';
import { loadSchema } from '../utils/files.js';
import { loadConfig } from '../utils/config.js';

/**
 * `kysely-schema validate` — validate the schema definition.
 */
export async function validateCommand(): Promise<void> {
    console.log(chalk.cyan('⚡ Validating schema...\n'));

    try {
        const config = await loadConfig();
        const schema = await loadSchema(config.schemaPath);

        const errors = validateSchema(schema);

        if (errors.length === 0) {
            console.log(chalk.green('✨ Schema is valid!'));
            return;
        }

        console.log(chalk.red(`✖ Found ${errors.length} validation error(s):\n`));

        for (const err of errors) {
            const location = err.column
                ? `${err.table}.${err.column}`
                : err.table;
            console.log(chalk.red(`  ✖ ${location}: ${err.message}`));
        }

        process.exit(1);
    } catch (error) {
        console.error(chalk.red('✖ Failed to validate schema:'), error);
        process.exit(1);
    }
}
