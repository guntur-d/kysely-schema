# kysely-schema-cli

> The command-line interface for [kysely-schema](https://github.com/guntur-d/kysely-schema), a schema-first development tool for Kysely.

[![npm version](https://img.shields.io/npm/v/kysely-schema-cli.svg)](https://www.npmjs.com/package/kysely-schema-cli)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ⚠️ Development Status

This package is in early development. Breaking changes may occur.

## Installation

```bash
npm install -D kysely-schema-cli
# or
pnpm add -D kysely-schema-cli
# or
yarn add -D kysely-schema-cli
```

## Usage

Initialize a new project (interactively installs dependencies + drivers):

```bash
npx kysely-schema init
# or short alias:
npx kys init
```

Generate migration from schema changes:

```bash
npx kys gm "add_users_table"
```

Generate TypeScript types:

```bash
npx kys gt
```

Start dev watcher (auto-regenerates types + validates schema):

```bash
npx kys dev
```

## Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `init` | | Scaffold a new project |
| `generate-migration <name>` | `gm` | Generate migration file from schema changes |
| `generate-types` | `gt` | Generate TypeScript types (`database.ts`) |
| `diff` | | Show pending schema changes without migrating |
| `validate` | | Validate schema definition for errors |
| `dev` | | Watch mode: auto-validate + auto-generate types |

## Documentation

Full documentation is available in the [main repository](https://github.com/guntur-d/kysely-schema#readme).
