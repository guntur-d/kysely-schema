import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import { schemaTemplate, configTemplate } from 'kysely-schema';
import { askSelect, askYesNo } from '../utils/prompts.js';
import { DIALECTS, type DialectInfo } from '../utils/dialects.js';
import { VERSION, KYSELY_VERSION, KYSELY_PEER_RANGE } from '../utils/version.js';

/**
 * `kysely-schema init` — interactive project scaffolding.
 *
 *  1. Show version + Kysely compatibility warning
 *  2. Ask which database dialect (PostgreSQL, MySQL, SQLite, MSSQL)
 *  3. Ask whether to install Kysely + driver
 *  4. Scaffold config, schema, migrations, generated, .kysely-schema
 *  5. Generate db.ts (connection) + migrate.ts (runner)
 */
export async function initCommand(): Promise<void> {
    console.log(chalk.cyan.bold('\n⚡ kysely-schema init\n'));

    // ── Version + compatibility notice ───────────────────────────────
    console.log(chalk.dim(`  kysely-schema v${VERSION}`));
    console.log(chalk.yellow(`  ⚠ Tested with Kysely ${KYSELY_VERSION} (compatible: ${KYSELY_PEER_RANGE})`));
    console.log(chalk.yellow(`    Using a different Kysely version may cause issues.`));
    console.log('');

    try {
        // ── 1. Pick dialect ──────────────────────────────────────────
        const dialectValue = await askSelect(
            'Which database?',
            DIALECTS.map((d) => ({ label: d.label, value: d.value })),
        );
        const dialect = DIALECTS.find((d) => d.value === dialectValue)!;

        console.log(chalk.dim(`\n  → ${dialect.label} selected\n`));

        // ── 2. Optionally install dependencies ───────────────────────
        const shouldInstall = await askYesNo(
            `Install ${dialect.packages.join(', ')}?`,
            true,
        );

        if (shouldInstall) {
            console.log('');
            await installPackages(dialect);
        }

        console.log('');

        // ── 3. Scaffold directories + files ──────────────────────────
        const configPath = 'kysely-schema.config.ts';
        await fs.writeFile(configPath, configTemplate);
        console.log(chalk.green('  ✔'), `Created ${configPath}`);

        await fs.mkdir('schema', { recursive: true });
        const schemaPath = path.join('schema', 'index.ts');
        await fs.writeFile(schemaPath, schemaTemplate);
        console.log(chalk.green('  ✔'), `Created ${schemaPath}`);

        await fs.mkdir('migrations', { recursive: true });
        console.log(chalk.green('  ✔'), 'Created migrations/');

        await fs.mkdir('generated', { recursive: true });
        console.log(chalk.green('  ✔'), 'Created generated/');

        await fs.mkdir('.kysely-schema', { recursive: true });
        console.log(chalk.green('  ✔'), 'Created .kysely-schema/');

        // ── 4. Generate db.ts + migrate.ts ───────────────────────────
        await fs.writeFile('db.ts', dialect.dbTemplate);
        console.log(chalk.green('  ✔'), 'Created db.ts');

        await fs.writeFile('migrate.ts', dialect.migrateTemplate);
        console.log(chalk.green('  ✔'), 'Created migrate.ts');

        // ── Done! ────────────────────────────────────────────────────
        console.log(chalk.green('\n✨ kysely-schema initialized successfully!\n'));

        console.log(chalk.dim('Next steps:'));
        console.log(chalk.dim('  1. Define your schema in schema/index.ts'));
        console.log(chalk.dim('  2. Run: kys gm "initial"'));
        console.log(chalk.dim('  3. Run: kys gt'));
        console.log(chalk.dim('  4. Run: npx tsx migrate.ts'));
        console.log('');
    } catch (error) {
        console.error(chalk.red('\n✖ Failed to initialize:'), error);
        process.exit(1);
    }
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function detectPM(): Promise<string> {
    try {
        await fs.access('pnpm-lock.yaml');
        return 'pnpm';
    } catch { /* not pnpm */ }
    try {
        await fs.access('yarn.lock');
        return 'yarn';
    } catch { /* not yarn */ }
    return 'npm';
}

async function installPackages(dialect: DialectInfo): Promise<void> {
    const pm = await detectPM();
    const pkgs = dialect.packages.join(' ');
    const cmd = `${pm} add ${pkgs}`;

    console.log(chalk.dim(`  $ ${cmd}`));

    try {
        execSync(cmd, { stdio: 'inherit' });
        console.log(chalk.green(`  ✔ Installed ${pkgs}`));
    } catch {
        console.log(chalk.yellow(`  ⚠ Could not install automatically.`));
        console.log(chalk.yellow(`    Run manually: ${cmd}`));
    }
}
