import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { SchemaDefinition } from 'kysely-schema';

/**
 * Dynamically import a user's schema file and return the default export.
 * The schema file is expected to export a SchemaDefinition as the default.
 */
export async function loadSchema(schemaPath: string): Promise<SchemaDefinition> {
    const resolved = path.resolve(schemaPath);

    try {
        const mod = await import(resolved);
        const schema = mod.default ?? mod;

        if (!schema || !schema.tables) {
            throw new Error(
                `Schema file at "${resolved}" does not export a valid SchemaDefinition. ` +
                `Make sure you use \`export default defineSchema({ ... })\`.`,
            );
        }

        return schema as SchemaDefinition;
    } catch (error: any) {
        if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND') {
            throw new Error(`Schema file not found: ${resolved}`);
        }
        throw error;
    }
}

/**
 * Save a JSON snapshot of the current schema for later diffing.
 */
export async function saveSnapshot(
    snapshotDir: string,
    schema: SchemaDefinition,
): Promise<void> {
    await fs.mkdir(snapshotDir, { recursive: true });

    const snapshot = {
        version: '1',
        timestamp: new Date().toISOString(),
        schema,
    };

    const snapshotPath = path.join(snapshotDir, 'latest.json');
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));
}

/**
 * Load the latest schema snapshot (if one exists).
 */
export async function loadLatestSnapshot(
    snapshotDir: string,
): Promise<SchemaDefinition | null> {
    const snapshotPath = path.join(snapshotDir, 'latest.json');

    try {
        const raw = await fs.readFile(snapshotPath, 'utf-8');
        const snapshot = JSON.parse(raw);
        return snapshot.schema as SchemaDefinition;
    } catch {
        return null;
    }
}
