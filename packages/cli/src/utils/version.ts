/**
 * Version constants for kysely-schema.
 *
 * When updating supported Kysely version, update KYSELY_VERSION here
 * and the peerDependencies in packages/core/package.json.
 */

/** kysely-schema version */
export const VERSION = '0.1.0';

/** The exact Kysely version this release is tested against */
export const KYSELY_VERSION = '0.27.6';

/** Semver range for peer dependency compatibility */
export const KYSELY_PEER_RANGE = '>=0.27.0 <0.28.0';
