import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import chalk from 'chalk';
import { TypeGenerator } from 'kysely-schema';
import { loadSchema } from '../utils/files.js';
import { loadConfig } from '../utils/config.js';

/**
 * `kysely-schema generate-types` — generate TypeScript types from schema.
 */
export async function generateTypesCommand(): Promise<void> {
    console.log(chalk.cyan('⚡ Generating TypeScript types...\n'));

    try {
        const config = await loadConfig();
        const schema = await loadSchema(config.schemaPath);

        const generator = new TypeGenerator();
        const types = generator.generate(schema);

        const generatedDir = config.generatedDir;
        await fs.mkdir(generatedDir, { recursive: true });

        const typesPath = path.join(generatedDir, 'Database.ts');
        await fs.writeFile(typesPath, types);

        console.log(chalk.green('  ✔'), `Types written to: ${typesPath}`);
    } catch (error) {
        console.error(chalk.red('✖ Failed to generate types:'), error);
        process.exit(1);
    }
}
