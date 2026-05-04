#!/usr/bin/env node
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { parse, stringify } from "comment-json";

const PLUGIN_ID = "kilocode-magic-context";
const CONFIG_FILE = "kilo-magic-context.jsonc";
const KILO_CONFIG_FILE = "kilo.jsonc";

type KiloConfig = {
    plugin?: Array<string | [string, Record<string, unknown>]>;
    compaction?: {
        auto?: boolean;
        prune?: boolean;
        [key: string]: unknown;
    };
    [key: string]: unknown;
};

type SetupOptions = {
    plugin?: string;
    project?: boolean;
    cwd: string;
};

function cleanPath(value: string | undefined): string | undefined {
    const cleaned = value?.replace(/[\r\n]+/g, "").trim();
    return cleaned || undefined;
}

function homeDir(): string {
    return cleanPath(process.env.KILO_TEST_HOME) ?? homedir();
}

function dataRoot(): string {
    return (
        cleanPath(process.env.XDG_DATA_HOME) ??
        cleanPath(process.env.LOCALAPPDATA) ??
        join(homeDir(), ".local", "share")
    );
}

function configRoot(): string {
    return (
        cleanPath(process.env.XDG_CONFIG_HOME) ??
        cleanPath(process.env.APPDATA) ??
        join(homeDir(), ".config")
    );
}

function kiloDataDir(): string {
    return join(dataRoot(), "kilo");
}

function kiloConfigDir(): string {
    return cleanPath(process.env.KILO_CONFIG_DIR) ?? join(configRoot(), "kilo");
}

function kiloDbPath(): string {
    const explicit = cleanPath(process.env.KILO_DB);
    if (!explicit) return join(kiloDataDir(), "kilo.db");
    if (explicit === ":memory:" || isAbsolute(explicit)) return explicit;
    return join(kiloDataDir(), explicit);
}

function pluginStorageDir(): string {
    return join(kiloDataDir(), "storage", "plugin", PLUGIN_ID);
}

function contextDbPath(): string {
    return join(pluginStorageDir(), "context.db");
}

function sourceRootFromEntrypoint(): string {
    const here = fileURLToPath(import.meta.url);
    for (const candidate of [
        resolve(dirname(here), "..", "..", ".."),
        resolve(dirname(here), "..", "..", "..", ".."),
        process.cwd(),
    ]) {
        if (existsSync(join(candidate, "packages", "plugin", "package.json"))) return candidate;
    }
    return process.cwd();
}

function defaultPluginSpec(): string {
    const root = sourceRootFromEntrypoint();
    const localPlugin = join(root, "packages", "plugin");
    if (existsSync(join(localPlugin, "package.json"))) return pathToFileURL(localPlugin).href;
    return PLUGIN_ID;
}

function getVersion(): string {
    const req = createRequire(import.meta.url);
    for (const relPath of ["../../package.json", "../package.json"]) {
        try {
            const pkg = req(relPath) as { version?: unknown };
            if (typeof pkg.version === "string" && pkg.version.length > 0) return pkg.version;
        } catch {
            // Try the other source/dist layout.
        }
    }
    return "0.0.0";
}

function readJsoncObject(path: string): KiloConfig {
    if (!existsSync(path)) return {};
    const parsed = parse(readFileSync(path, "utf-8"), undefined, true) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error(`${path} must contain a JSON object`);
    }
    return parsed as KiloConfig;
}

function writeJsoncObject(path: string, value: KiloConfig): void {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${stringify(value, null, 2)}\n`, "utf-8");
}

function pluginEntryMatches(entry: string | [string, Record<string, unknown>], spec: string): boolean {
    const value = Array.isArray(entry) ? entry[0] : entry;
    return value === spec || value.includes(PLUGIN_ID) || value.includes("kilo-magic-context");
}

function ensurePluginEntry(config: KiloConfig, spec: string): boolean {
    const plugins = Array.isArray(config.plugin) ? [...config.plugin] : [];
    if (plugins.some((entry) => pluginEntryMatches(entry, spec))) {
        config.plugin = plugins;
        return false;
    }
    plugins.push(spec);
    config.plugin = plugins;
    return true;
}

function ensureCompactionDisabled(config: KiloConfig): boolean {
    const before = JSON.stringify(config.compaction ?? {});
    config.compaction = {
        ...(config.compaction ?? {}),
        auto: false,
        prune: false,
    };
    return before !== JSON.stringify(config.compaction);
}

function defaultMagicContextConfig(): KiloConfig {
    return {
        $schema: "https://raw.githubusercontent.com/Kilo-Org/kilo-magic-context/main/assets/kilo-magic-context.schema.json",
        enabled: true,
        ctx_reduce_enabled: true,
        cache_ttl: "5m",
        execute_threshold_percentage: 65,
        history_budget_percentage: 0.15,
        model_context_limits: {
            default: 200000,
        },
        compaction_markers: {
            enabled: true,
        },
        dreamer: {
            enabled: false,
        },
        sidekick: {
            enabled: false,
        },
    };
}

function writePluginConfigIfMissing(targetDir: string): string {
    const path = join(targetDir, CONFIG_FILE);
    if (!existsSync(path)) writeJsoncObject(path, defaultMagicContextConfig());
    return path;
}

function parseSetupArgs(argv: string[]): SetupOptions {
    const options: SetupOptions = { cwd: process.cwd() };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--plugin") {
            const value = argv[++i];
            if (!value) throw new Error("--plugin requires a value");
            options.plugin = normalizePluginSpec(value);
            continue;
        }
        if (arg === "--project") {
            options.project = true;
            continue;
        }
        if (arg === "--cwd") {
            const value = argv[++i];
            if (!value) throw new Error("--cwd requires a value");
            options.cwd = resolve(value);
            continue;
        }
        throw new Error(`Unknown setup flag: ${arg}`);
    }
    return options;
}

function normalizePluginSpec(value: string): string {
    if (value.startsWith("file://") || value.includes("://")) return value;
    const absolute = isAbsolute(value) ? value : resolve(value);
    if (existsSync(absolute)) return pathToFileURL(absolute).href;
    return value;
}

function kiloConfigPath(options: SetupOptions): string {
    if (options.project) return join(options.cwd, ".kilo", KILO_CONFIG_FILE);
    return join(kiloConfigDir(), KILO_CONFIG_FILE);
}

function runSetup(argv: string[]): number {
    const options = parseSetupArgs(argv);
    const spec = options.plugin ?? defaultPluginSpec();
    const configPath = kiloConfigPath(options);
    const config = readJsoncObject(configPath);
    const pluginAdded = ensurePluginEntry(config, spec);
    const compactionChanged = ensureCompactionDisabled(config);
    writeJsoncObject(configPath, config);

    const pluginConfigPath = writePluginConfigIfMissing(options.project ? join(options.cwd, ".kilo") : kiloConfigDir());

    console.log("Kilo Magic Context setup complete.");
    console.log(`  Kilo config: ${configPath}`);
    console.log(`  Plugin config: ${pluginConfigPath}`);
    console.log(`  Plugin entry: ${spec}${pluginAdded ? "" : " (already present)"}`);
    console.log(
        `  Compaction: auto=false, prune=false${compactionChanged ? "" : " (already disabled)"}`,
    );
    return 0;
}

function checkDoctor(): Array<{ level: "pass" | "warn" | "fail"; message: string }> {
    const results: Array<{ level: "pass" | "warn" | "fail"; message: string }> = [];
    const configPath = join(kiloConfigDir(), KILO_CONFIG_FILE);
    const pluginConfigPath = join(kiloConfigDir(), CONFIG_FILE);

    try {
        const config = readJsoncObject(configPath);
        const plugins = Array.isArray(config.plugin) ? config.plugin : [];
        const hasPlugin = plugins.some((entry) => pluginEntryMatches(entry, defaultPluginSpec()));
        results.push({
            level: hasPlugin ? "pass" : "fail",
            message: hasPlugin
                ? `Plugin is registered in ${configPath}`
                : `Plugin is not registered in ${configPath}`,
        });

        const autoDisabled = config.compaction?.auto === false;
        const pruneDisabled = config.compaction?.prune === false;
        results.push({
            level: autoDisabled ? "pass" : "fail",
            message: autoDisabled ? "compaction.auto is false" : "compaction.auto is not false",
        });
        results.push({
            level: pruneDisabled ? "pass" : "fail",
            message: pruneDisabled ? "compaction.prune is false" : "compaction.prune is not false",
        });
    } catch (error) {
        results.push({
            level: "fail",
            message: `Cannot read Kilo config: ${error instanceof Error ? error.message : String(error)}`,
        });
    }

    results.push({
        level: existsSync(pluginConfigPath) ? "pass" : "warn",
        message: existsSync(pluginConfigPath)
            ? `Plugin config exists: ${pluginConfigPath}`
            : `Plugin config not found, defaults will be used: ${pluginConfigPath}`,
    });
    results.push({
        level: existsSync(kiloDbPath()) ? "pass" : "warn",
        message: existsSync(kiloDbPath()) ? `Kilo DB: ${kiloDbPath()}` : `Kilo DB not found yet: ${kiloDbPath()}`,
    });
    results.push({
        level: existsSync(contextDbPath()) ? "pass" : "warn",
        message: existsSync(contextDbPath())
            ? `Magic Context DB: ${contextDbPath()}`
            : `Magic Context DB not created yet: ${contextDbPath()}`,
    });

    return results;
}

function runDoctor(argv: string[]): number {
    if (argv.includes("--fix")) return runSetup(argv.filter((arg) => arg !== "--fix"));
    const results = checkDoctor();
    for (const result of results) {
        const label = result.level.toUpperCase().padEnd(4, " ");
        console.log(`${label} ${result.message}`);
    }
    if (results.some((result) => result.level === "fail")) {
        console.log("");
        console.log("Run `kilo-magic-context doctor --fix` to apply the standard local setup.");
        return 1;
    }
    return 0;
}

function legacyDataRoot(): string {
    return (
        cleanPath(process.env.XDG_DATA_HOME) ??
        cleanPath(process.env.LOCALAPPDATA) ??
        join(homeDir(), ".local", "share")
    );
}

function defaultLegacySources(): string[] {
    const root = legacyDataRoot();
    return [
        join(root, "cortexkit", "magic-context"),
        join(root, "opencode", "storage", "plugin", "magic-context"),
    ];
}

function parseMigrateArgs(argv: string[]): { from?: string; force: boolean } {
    const result = { from: undefined as string | undefined, force: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--from") {
            const value = argv[++i];
            if (!value) throw new Error("--from requires a path");
            result.from = resolve(value);
            continue;
        }
        if (arg === "--force") {
            result.force = true;
            continue;
        }
        throw new Error(`Unknown migrate flag: ${arg}`);
    }
    return result;
}

function copyLegacyDatabase(sourceDir: string, force: boolean): void {
    const sourceDb = join(sourceDir, "context.db");
    const targetDir = pluginStorageDir();
    const targetDb = contextDbPath();
    if (!existsSync(sourceDb)) throw new Error(`No context.db found at ${sourceDb}`);
    if (existsSync(targetDb) && !force) {
        throw new Error(`${targetDb} already exists. Re-run with --force to overwrite it.`);
    }

    mkdirSync(targetDir, { recursive: true });
    for (const suffix of ["", "-wal", "-shm"]) {
        const src = `${sourceDb}${suffix}`;
        if (existsSync(src)) copyFileSync(src, `${targetDb}${suffix}`);
    }
    const sourceModels = join(sourceDir, "models");
    const targetModels = join(targetDir, "models");
    if (existsSync(sourceModels)) cpSync(sourceModels, targetModels, { recursive: true, force: true });
}

function runMigrateFromOpenCode(argv: string[]): number {
    const { from, force } = parseMigrateArgs(argv);
    const sourceDir = from ?? defaultLegacySources().find((candidate) => existsSync(join(candidate, "context.db")));
    if (!sourceDir) {
        console.error("No legacy OpenCode Magic Context DB found.");
        console.error("Use `kilo-magic-context migrate-from-opencode --from <dir>`.");
        return 1;
    }
    copyLegacyDatabase(sourceDir, force);
    console.log(`Imported legacy Magic Context DB from ${sourceDir}`);
    console.log(`Kilo Magic Context DB: ${contextDbPath()}`);
    return 0;
}

function runPack(argv: string[]): number {
    if (argv.length > 0) throw new Error(`Unknown pack flag: ${argv[0]}`);
    const root = sourceRootFromEntrypoint();
    const command = process.platform === "win32" ? "bun.exe" : "bun";
    const result = spawnSync(command, ["run", "pack:release"], {
        cwd: root,
        stdio: "inherit",
        shell: process.platform === "win32",
    });
    return result.status ?? 1;
}

function printUsage(): void {
    console.log(`
Kilo Magic Context CLI

Usage:
  kilo-magic-context setup [--plugin <path|file://|pkg>] [--project] [--cwd <dir>]
  kilo-magic-context doctor [--fix]
  kilo-magic-context migrate-from-opencode [--from <legacy-storage-dir>] [--force]
  kilo-magic-context pack
  kilo-magic-context --version

Defaults:
  setup writes ${KILO_CONFIG_FILE} and ${CONFIG_FILE}
  storage is ${pluginStorageDir()}
`);
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
    try {
        const command = argv[0];
        const rest = argv.slice(1);
        if (!command || command === "--help" || command === "-h" || command === "help") {
            printUsage();
            return 0;
        }
        if (command === "--version" || command === "-v") {
            console.log(getVersion());
            return 0;
        }
        if (command === "setup") return runSetup(rest);
        if (command === "doctor") return runDoctor(rest);
        if (command === "migrate-from-opencode") return runMigrateFromOpenCode(rest);
        if (command === "pack") return runPack(rest);

        console.error(`Unknown command: ${command}`);
        printUsage();
        return 1;
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        return 1;
    }
}

main().then((code) => process.exit(code));
