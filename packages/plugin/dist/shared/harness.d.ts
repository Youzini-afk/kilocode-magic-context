/**
 * Identifier for the host harness this plugin is running inside.
 *
 * Magic Context's SQLite database lives at a vendor-scoped path
 * (`<Kilo data>/storage/plugin/kilocode-magic-context/`). Session-scoped
 * tables carry a `harness` column populated from this module so legacy
 * imports can stay distinguishable from Kilo-native rows.
 *
 * Each plugin entry point sets this once at boot, before any DB write
 * happens:
 * - Kilo plugin: relies on the default ("kilo").
 *
 * NEVER read this from configuration or session state — it is a
 * boot-time constant per plugin instance. Cross-harness leakage is a
 * correctness bug, not a feature.
 */
export type HarnessId = "kilo" | "opencode" | "pi";
/**
 * Set the harness identifier for this plugin instance. Must be called once
 * at boot before any DB write happens. Subsequent calls with a different
 * value throw to prevent accidental mid-session swaps that would corrupt
 * the harness column and break per-harness session scoping.
 *
 * Calling with the same value as the current is a no-op (safe to call
 * defensively).
 */
export declare function setHarness(value: HarnessId): void;
/**
 * Get the current harness identifier. Used by storage modules when
 * INSERTing session-scoped rows so each row is correctly attributed.
 */
export declare function getHarness(): HarnessId;
/**
 * Test-only helper to reset harness state between test cases. Do NOT call
 * from production code paths.
 */
export declare function _resetHarnessForTesting(): void;
//# sourceMappingURL=harness.d.ts.map