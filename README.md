# Kilo Magic Context

Kilo-native port of Magic Context: cache-aware context reduction, historian summaries, project memory, retrieval tools, and optional dreamer/sidekick workflows for long Kilo sessions.

This repository is intentionally independent from the main Kilo repo. Install it as a local path plugin during development, then pack it as `.tgz` artifacts for release.

## Workspace

- `packages/plugin` - Kilo server/TUI plugin (`id: kilocode-magic-context`)
- `packages/cli` - `kilo-magic-context` setup, doctor, explicit migration, and pack commands
- `packages/dashboard` - dashboard UI carried from the upstream project
- `packages/e2e-tests` - integration test workspace, still being Kilo-adapted

## Local Setup

```sh
bun install
bun run build
```

Register the plugin in Kilo:

```sh
bun run --cwd packages/cli build
bun packages/cli/src/index.ts setup --plugin file:///E:/cursor_project/kilocode/kilocode-magic-context/packages/plugin
```

`setup` writes:

- `kilo.jsonc` plugin entry
- `compaction.auto=false`
- `compaction.prune=false`
- `kilo-magic-context.jsonc` with safe defaults

## Configuration

The plugin reads `kilo-magic-context.jsonc` in this order:

1. Project `.kilo/`
2. Project `.kilocode/`
3. Project root
4. Kilo config directory, or `KILO_CONFIG_DIR`

It also reads legacy `magic-context.jsonc` in those Kilo/project locations, but it does not auto-read `~/.config/opencode` and does not auto-share old OpenCode data.

## Storage

Kilo Magic Context stores data in:

```text
<kilo data>/storage/plugin/kilocode-magic-context/context.db
```

To import an older OpenCode Magic Context database, run the explicit migration command:

```sh
kilo-magic-context migrate-from-opencode --from <legacy-storage-dir>
```

## Commands

```sh
kilo-magic-context setup
kilo-magic-context doctor
kilo-magic-context doctor --fix
kilo-magic-context migrate-from-opencode
kilo-magic-context pack
```

## Build And Release

```sh
bun run typecheck
bun run build
bun run pack:release
```
