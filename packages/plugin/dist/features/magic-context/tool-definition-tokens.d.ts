/**
 * Tool-definition token measurement store.
 *
 * OpenCode's `tool.definition` hook fires once per tool per
 * `ToolRegistry.tools()` call, with `{ toolID }` as input and
 * `{ description, parameters }` as output. Crucially the hook input does NOT
 * carry `sessionID` — the tool set is computed per
 * `{providerID, modelID, agent}` combination, independent of session.
 *
 * We measure each tool's description + JSON-schema parameters, tokenize with
 * the same Claude tokenizer used everywhere else in the plugin, and store
 * per-tool totals keyed by `${providerID}/${modelID}/${agentName}`. Inner map
 * keys on `toolID` so every hook fire idempotently overwrites its own slot
 * (same tool set on each turn → same key → same measured total).
 *
 * Consumers (RPC sidebar/status handlers) look up the active session's
 * measurement via `getMeasuredToolDefinitionTokens(providerID, modelID,
 * agentName)`. Returns `undefined` when the key has never been measured — the
 * caller is expected to fall back to residual math or show zero.
 *
 * The store lives entirely in-memory. A process restart re-measures on the
 * first turn, which is essentially free; persisting these values across
 * restarts would add schema/migration cost for no user-visible benefit.
 */
/**
 * Tokenize a single tool's schema and store it under the given key. Called
 * from the `tool.definition` plugin hook once per tool per flight. Same
 * toolID on a later flight overwrites its slot — the total for the key stays
 * consistent even if descriptions or parameters drift between turns.
 */
export declare function recordToolDefinition(providerID: string, modelID: string, agentName: string | undefined, toolID: string, description: string, parameters: unknown): void;
/**
 * Returns the summed measured tokens for a `{provider, model, agent}` key,
 * or `undefined` when never measured (e.g. fresh session before first turn).
 */
export declare function getMeasuredToolDefinitionTokens(providerID: string, modelID: string, agentName: string | undefined): number | undefined;
/** Test helper: reset the store so suites don't leak measurements. */
export declare function __resetToolDefinitionMeasurements(): void;
/** Inspection helper: snapshot the current store (for debug logging/tests). */
export declare function getToolDefinitionSnapshot(): Array<{
    key: string;
    totalTokens: number;
    toolCount: number;
}>;
//# sourceMappingURL=tool-definition-tokens.d.ts.map