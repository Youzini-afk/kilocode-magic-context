/**
 * SQLite chokepoint — runtime-detected backend selection.
 *
 * The same shipped plugin artifact must run under two different runtimes:
 *   - Bun (current OpenCode releases) → uses `bun:sqlite` (built-in, fast)
 *   - Node (OpenCode beta + future Pi plugin) → uses `better-sqlite3`
 *
 * Bun cannot load `better-sqlite3` (oven-sh/bun#4290), and Node has no
 * `bun:sqlite` module. Static imports of either would crash at parse time
 * in the wrong runtime, so we use dynamic imports gated by runtime detection.
 *
 * The Function-constructor wrapper around `import()` defeats bundler static
 * analysis — without it, esbuild/bun build would try to resolve both modules
 * during the bundle step, including the one that doesn't exist in the build
 * runtime.
 *
 * Both libraries expose ~95% API parity:
 *   - new Database(path, { readonly?: boolean })
 *   - db.prepare(sql).run/get/all
 *   - db.exec(multistatement)
 *   - db.transaction(fn) → wrapped function
 *   - db.close()
 *
 * The 5% that differs (db.query, db.run, db.close(boolean), Database.open)
 * is either rewritten to common-subset patterns or hidden behind the helpers
 * in `./sqlite-helpers.ts`.
 */
/**
 * Database constructor compatible with both bun:sqlite and better-sqlite3.
 *
 * The TypeScript type intentionally references @types/better-sqlite3 because
 * its definitions are richer than @types/bun's bun:sqlite types and bun:sqlite
 * is a structural superset for the API surface we use. Calls written against
 * this type work correctly under both runtimes at runtime.
 *
 * @types/better-sqlite3 uses `export = Database` (CommonJS interop), which
 * surfaces in TypeScript as `import Database = require("better-sqlite3")`.
 * We capture the DatabaseConstructor type from the namespace re-export.
 */
import type BetterSqlite3 from "better-sqlite3";
export declare const Database: typeof BetterSqlite3;
/** Instance type alias used by helpers and storage modules. */
export type Database = BetterSqlite3.Database;
/**
 * Statement instance type used for WeakMap caches throughout the codebase.
 *
 * We deliberately use the variadic Statement<unknown[], unknown> shape rather
 * than `ReturnType<Database["prepare"]>` because the latter resolves through
 * a conditional return type in @types/better-sqlite3 that confuses TypeScript
 * about how many arguments .run/.get/.all accept. With this explicit type,
 * cached statements accept any number of bind args (matching bun:sqlite's
 * historical behavior in this codebase).
 */
export type Statement = BetterSqlite3.Statement<unknown[], unknown>;
//# sourceMappingURL=sqlite.d.ts.map