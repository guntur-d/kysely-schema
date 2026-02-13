#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { generateMigrationCommand } from './commands/generate-migration.js';
import { generateTypesCommand } from './commands/generate-types.js';
import { diffCommand } from './commands/diff.js';
import { validateCommand } from './commands/validate.js';
import { devCommand } from './commands/dev.js';

const program = new Command();

program
    .name('kysely-schema')
    .description('Schema-first development tool for Kysely')
    .version('0.1.0');

program
    .command('init')
    .description('Initialize kysely-schema in the current project')
    .action(initCommand);

program
    .command('generate-migration')
    .alias('gm')
    .description('Generate a Kysely migration from your schema')
    .argument('<name>', 'Migration name (e.g. "initial", "add_posts")')
    .action(generateMigrationCommand);

program
    .command('generate-types')
    .alias('gt')
    .description('Generate TypeScript types from your schema')
    .action(generateTypesCommand);

program
    .command('diff')
    .description('Show schema changes since last migration')
    .action(diffCommand);

program
    .command('validate')
    .description('Validate your schema definition')
    .action(validateCommand);

program
    .command('dev')
    .description('Watch schema and auto-regenerate types, validate, and show diffs')
    .action(devCommand);

program.parse();
