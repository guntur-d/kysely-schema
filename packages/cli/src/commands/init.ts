import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import chalk from 'chalk';
import { schemaTemplate, configTemplate } from 'kysely-schema';

/**
 * `kysely-schema init` — scaffold a new project.
 */
export async function initCommand(): Promise<void> {
    console.log(chalk.cyan('⚡ Initializing kysely-schema...\n'));

    try {
        // Create config file
        const configPath = 'kysely-schema.config.ts';
        await fs.writeFile(configPath, configTemplate);
        console.log(chalk.green('  ✔'), `Created ${configPath}`);

        // Create schema directory + starter file
        await fs.mkdir('schema', { recursive: true });
        const schemaPath = path.join('schema', 'index.ts');
        await fs.writeFile(schemaPath, schemaTemplate);
        console.log(chalk.green('  ✔'), `Created ${schemaPath}`);

        // Create migrations directory
        await fs.mkdir('migrations', { recursive: true });
        console.log(chalk.green('  ✔'), 'Created migrations/');

        // Create generated directory
        await fs.mkdir('generated', { recursive: true });
        console.log(chalk.green('  ✔'), 'Created generated/');

        // Create snapshot directory
        await fs.mkdir('.kysely-schema', { recursive: true });
        console.log(chalk.green('  ✔'), 'Created .kysely-schema/');

        console.log(chalk.green('\n✨ kysely-schema initialized successfully!\n'));
        console.log(chalk.dim('Next steps:'));
        console.log(chalk.dim('  1. Define your schema in schema/index.ts'));
        console.log(chalk.dim('  2. Run: npx kysely-schema generate-migration "initial"'));
        console.log(chalk.dim('  3. Run: npx kysely-schema generate-types'));
    } catch (error) {
        console.error(chalk.red('✖ Failed to initialize:'), error);
        process.exit(1);
    }
}
