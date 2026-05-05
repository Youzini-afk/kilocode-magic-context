/**
 * Cross-runtime helpers that smooth over the small bun:sqlite ↔ better-sqlite3
 * API differences without leaking either library into call sites.
 */
import type { Database } from "./sqlite";
export declare function finalizeQuietly(statement: unknown): void;
/**
 * Close a database, ignoring errors.
 *
 * bun:sqlite supports `db.close(throwOnError = false)`. better-sqlite3 has
 * only `db.close()` and throws on already-closed databases. This helper
 * mirrors the bun "swallow errors" semantics for both runtimes — useful in
 * test teardown and `finally` blocks where the caller doesn't care whether
 * the close succeeded.
 */
export declare function closeQuietly(db: Database | null | undefined): void;
//# sourceMappingURL=sqlite-helpers.d.ts.map