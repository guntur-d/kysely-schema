import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';
import chalk from 'chalk';
import {
    TypeGenerator,
    validateSchema,
    SchemaDiffer,
    describeOperation,
} from 'kysely-schema';
import type { SchemaDefinition } from 'kysely-schema';
import { loadSchema, loadLatestSnapshot } from '../utils/files.js';
import { loadConfig } from '../utils/config.js';

/**
 * `kysely-schema dev` — watch schema files and auto-regenerate types,
 * validate, and show diffs on every change.
 */
export async function devCommand(): Promise<void> {
    const config = await loadConfig();
    const schemaPath = path.resolve(config.schemaPath);
    const schemaDir = path.dirname(schemaPath);

    console.log(chalk.cyan.bold('\n⚡ kysely-schema dev mode\n'));
    console.log(chalk.dim(`  Watching:  ${schemaDir}`));
    console.log(chalk.dim(`  Types:     ${path.resolve(config.generatedDir, 'Database.ts')}`));
    console.log(chalk.dim(`  Press Ctrl+C to stop\n`));

    // Run once immediately on start
    await runPipeline(config);

    // Debounce timer
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    // Watch the schema directory for changes
    const watcher = fs.watch(schemaDir, { recursive: true }, (_event, filename) => {
        if (!filename) return;
        if (!filename.endsWith('.ts')) return;

        // Debounce: wait 300ms after the last change before running
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            console.log(chalk.dim(`\n─── ${new Date().toLocaleTimeString()} ─── ${filename} changed ───\n`));
            await runPipeline(config);
        }, 300);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        watcher.close();
        console.log(chalk.dim('\n\n👋 Stopped watching.\n'));
        process.exit(0);
    });
}

// ── Pipeline: validate → generate types → show diff ───────────────────────

interface PipelineConfig {
    schemaPath: string;
    generatedDir: string;
    snapshotDir: string;
}

async function runPipeline(config: PipelineConfig): Promise<void> {
    let schema: SchemaDefinition;

    // 1. Load schema (clear module cache for hot-reload)
    try {
        // Invalidate the cached module so we get fresh changes
        const resolved = path.resolve(config.schemaPath);
        deleteFromModuleCache(resolved);

        schema = await loadSchema(config.schemaPath);
    } catch (error: any) {
        console.log(chalk.red('  ✖ Schema load error:'), error.message);
        return;
    }

    // 2. Validate
    const { validateSchema: validate } = await import('kysely-schema');
    const errors = validate(schema);

    if (errors.length > 0) {
        console.log(chalk.red(`  ✖ ${errors.length} validation error(s):`));
        for (const err of errors) {
            const loc = err.column ? `${err.table}.${err.column}` : err.table;
            console.log(chalk.red(`    • ${loc}: ${err.message}`));
        }
        return; // Don't generate types if schema is invalid
    }
    console.log(chalk.green('  ✔ Schema valid'));

    // 3. Generate types
    try {
        const generator = new TypeGenerator();
        const types = generator.generate(schema);

        const generatedDir = config.generatedDir;
        await fsPromises.mkdir(generatedDir, { recursive: true });

        const typesPath = path.join(generatedDir, 'Database.ts');
        await fsPromises.writeFile(typesPath, types);

        console.log(chalk.green(`  ✔ Types updated → ${typesPath}`));
    } catch (error: any) {
        console.log(chalk.red('  ✖ Type generation error:'), error.message);
    }

    // 4. Show diff (if snapshot exists)
    try {
        const previousSchema = await loadLatestSnapshot(config.snapshotDir);
        if (previousSchema) {
            const differ = new SchemaDiffer();
            const changes = differ.diff(previousSchema, schema);

            if (changes.length === 0) {
                console.log(chalk.dim('  ℹ No pending schema changes'));
            } else {
                console.log(chalk.yellow(`\n  📋 ${changes.length} pending change(s):`));
                for (const change of changes) {
                    console.log(chalk.yellow(`    ${describeOperation(change)}`));
                }
                console.log(
                    chalk.dim('\n  Run ') +
                    chalk.white('kysely-schema generate-migration "<name>"') +
                    chalk.dim(' when ready'),
                );
            }
        } else {
            console.log(chalk.dim('  ℹ No snapshot yet — run generate-migration to create one'));
        }
    } catch {
        // Snapshot comparison is optional — don't fail on it
    }
}

// ── Helper to invalidate Node's module cache ──────────────────────────────

function deleteFromModuleCache(resolvedPath: string): void {
    try {
        // For CJS
        if (typeof require !== 'undefined' && require.cache) {
            delete require.cache[resolvedPath];
        }
        // For ESM — append a cache-busting query param (handled in loadSchema)
    } catch {
        // Silently ignore
    }
}
