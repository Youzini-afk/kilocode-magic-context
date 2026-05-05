import { type ContextDatabase } from "../../features/magic-context/storage";
/**
 * Clear all per-session cache entries the system-prompt handler maintains,
 * including the module-scope user-profile/key-files maps and the per-handler
 * sticky-date/cached-docs maps (the latter passed in via the cleanup handle).
 * Called from the session-deleted event path.
 */
export declare function clearSystemPromptHashSession(sessionId: string, handleMaps: {
    stickyDateBySession: Map<string, string>;
    cachedDocsBySession: Map<string, string | null>;
}): void;
/**
 * Handle system prompt via experimental.chat.system.transform:
 *
 * 1. Inject generic magic-context guidance into the system prompt.
 *    Skips injection if guidance is already present (e.g., baked into the
 *    agent prompt by oh-my-opencode).
 *
 * 2. Detect system prompt changes for cache-flush triggering.
 *    If the hash changes between turns, the Anthropic prompt-cache prefix is
 *    already busted, so we flush queued operations immediately.
 */
export declare function createSystemPromptHashHandler(deps: {
    db: ContextDatabase;
    protectedTags: number;
    ctxReduceEnabled: boolean;
    dropToolStructure: boolean;
    dreamerEnabled: boolean;
    /** When true + dreamerEnabled, inject ARCHITECTURE.md and STRUCTURE.md into system prompt */
    injectDocs: boolean;
    /** Project root directory for reading doc files */
    directory: string;
    /**
     * One-shot signal that disk-backed adjuncts (project docs, user
     * profile, key files, sticky date) need to be re-read on this pass.
     * Drained at the end of the handler regardless of whether anything
     * actually refreshed — defer passes after this point MUST hit cached
     * values to keep the system prompt cache-stable.
     */
    systemPromptRefreshSessions: Set<string>;
    /**
     * Producer side: when this handler detects a real prompt-content hash
     * change, it adds the session to all three sets so downstream consumers
     * (transform `prepareCompartmentInjection`, postprocess heuristics)
     * react on the same cycle. The hash change usually pairs with a new
     * agent identity, so all three are appropriate.
     */
    historyRefreshSessions: Set<string>;
    pendingMaterializationSessions: Set<string>;
    lastHeuristicsTurnId: Map<string, string>;
    /** When true, inject stable user memories as <user-profile> into system prompt */
    experimentalUserMemories?: boolean;
    /** When true, inject pinned key files as <key-files> into system prompt */
    experimentalPinKeyFiles?: boolean;
    /** Token budget for key files injection (default 10000) */
    experimentalPinKeyFilesTokenBudget?: number;
    /** When true, add a temporal-awareness guidance paragraph + surface compartment dates */
    experimentalTemporalAwareness?: boolean;
    /** When true (and ctx_reduce_enabled is false), inject a "BEWARE: history compression is on"
     *  warning so the agent doesn't mimic its own caveman-compressed past output. */
    experimentalCavemanTextCompression?: boolean;
}): {
    handler: (input: {
        sessionID?: string;
    }, output: {
        system: string[];
    }) => Promise<void>;
    clearSession: (sessionId: string) => void;
};
//# sourceMappingURL=system-prompt-hash.d.ts.map