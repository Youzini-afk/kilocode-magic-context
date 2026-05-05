import { getOrCreateSessionMeta } from "../../features/magic-context/storage-meta";
import type { PluginContext } from "../../plugin/types";
export type LiveModelBySession = Map<string, {
    providerID: string;
    modelID: string;
}>;
export type VariantBySession = Map<string, string | undefined>;
export type AgentBySession = Map<string, string>;
export type RecentReduceBySession = Map<string, number>;
export type ToolUsageSinceUserTurn = Map<string, number>;
/**
 * Cache-busting signal sets — replaces the old monolithic `flushedSessions`.
 *
 * The old `Set<string>` conflated three independent lifetimes into one flag,
 * which caused defer passes blocked by an in-progress historian to keep
 * re-firing the same flush signal across multiple turns (Oracle review,
 * 2026-04-26). Each set now has exactly one consumer and one lifetime.
 *
 * Design rule: every producer that wants to refresh state should `add` to
 * EVERY set whose consumer needs to react. Consumers are responsible for
 * draining their own set after they consume the signal.
 */
/**
 * One-shot: signals that `<session-history>` (compartments + facts +
 * memories block in `message[0]`) needs to be rebuilt on the very next
 * pass. Consumed by `prepareCompartmentInjection()` in `transform.ts`,
 * which drains the entry after invocation regardless of whether a rebuild
 * actually occurred — the next defer pass MUST hit the cache.
 *
 * Producers: `/ctx-flush`, real variant change, system-prompt hash change,
 * historian publish (`onInjectionCacheCleared`), recomp publish, partial
 * recomp publish.
 *
 * NOT a producer: the background compressor — its output deliberately
 * lands on the next natural cache-bust pass instead of forcing one.
 */
export type HistoryRefreshSessions = Set<string>;
/**
 * One-shot: signals that the system-prompt adjuncts (project docs, user
 * profile, key files, sticky date) should be re-read from disk on the
 * very next system-transform call. Consumed by `system-prompt-hash.ts`,
 * which drains the entry after refreshing.
 *
 * Producers: `/ctx-flush`, real variant change, system-prompt hash change.
 *
 * NOT a producer: historian/compressor/recomp — those don't change disk
 * adjuncts, so refreshing them would burn IO for no reason.
 */
export type SystemPromptRefreshSessions = Set<string>;
/**
 * Persistent: signals that there are queued user `ctx_reduce` ops or
 * pending heuristic-cleanup work that MUST run, even if the current pass
 * can't safely run heuristics yet (e.g. a compartment run is active).
 * Consumed and drained by `transform-postprocess-phase.ts` only after
 * `shouldRunHeuristics` actually executes — survives any number of
 * blocked passes until the materialization succeeds.
 *
 * Producers: `/ctx-flush`, real variant change, system-prompt hash change,
 * historian publish, recomp publish, partial recomp publish.
 *
 * Why historian/recomp produce here too: those publish paths queue drop
 * ops via `queueDropsForCompartmentalizedMessages`. The next safe pass
 * needs to materialize those queued drops or context will accumulate.
 */
export type PendingMaterializationSessions = Set<string>;
/**
 * @deprecated Use `HistoryRefreshSessions`, `SystemPromptRefreshSessions`,
 * or `PendingMaterializationSessions` directly. Kept as a type alias only
 * for any external consumers that may still import it. Will be removed in
 * a future major.
 */
export type FlushedSessions = Set<string>;
export type LastHeuristicsTurnId = Map<string, string>;
export declare function getLiveNotificationParams(sessionId: string, liveModelBySession: LiveModelBySession, variantBySession: VariantBySession, agentBySession?: AgentBySession): {
    agent?: string;
    variant?: string;
    providerId?: string;
    modelId?: string;
};
export declare function createChatMessageHook(args: {
    db: Parameters<typeof getOrCreateSessionMeta>[0];
    toolUsageSinceUserTurn: ToolUsageSinceUserTurn;
    recentReduceBySession: RecentReduceBySession;
    liveModelBySession: LiveModelBySession;
    variantBySession: VariantBySession;
    agentBySession: AgentBySession;
    /** Variant changes invalidate `<session-history>` injection cache and
     *  may pair with a different model whose pending drops still need to
     *  materialize — so a real variant flip signals all three sets. */
    historyRefreshSessions: HistoryRefreshSessions;
    systemPromptRefreshSessions: SystemPromptRefreshSessions;
    pendingMaterializationSessions: PendingMaterializationSessions;
    lastHeuristicsTurnId: LastHeuristicsTurnId;
    ctxReduceEnabled?: boolean;
}): (input: {
    sessionID?: string;
    variant?: string;
    agent?: string;
    model?: {
        providerID?: string;
        modelID?: string;
    };
}) => Promise<void>;
export declare function createEventHook(args: {
    eventHandler: (input: {
        event: {
            type: string;
            properties?: unknown;
        };
    }) => Promise<void>;
    contextUsageMap: Map<string, {
        usage: {
            percentage: number;
            inputTokens: number;
        };
        updatedAt: number;
    }>;
    db: Parameters<typeof getOrCreateSessionMeta>[0];
    liveModelBySession: LiveModelBySession;
    variantBySession: VariantBySession;
    agentBySession: AgentBySession;
    recentReduceBySession: RecentReduceBySession;
    toolUsageSinceUserTurn: ToolUsageSinceUserTurn;
    /** All three sets are cleaned on `session.deleted` to prevent leaks. */
    historyRefreshSessions: HistoryRefreshSessions;
    systemPromptRefreshSessions: SystemPromptRefreshSessions;
    pendingMaterializationSessions: PendingMaterializationSessions;
    lastHeuristicsTurnId: LastHeuristicsTurnId;
    commitSeenLastPass?: Map<string, boolean>;
    client: PluginContext["client"];
    protectedTags: number;
    ctxReduceEnabled?: boolean;
}): (input: {
    event: {
        type: string;
        properties?: unknown;
    };
}) => Promise<void>;
export declare function createCommandExecuteBeforeHook(commandHandler: {
    "command.execute.before": (input: import("./command-handler").CommandExecuteInput, output: import("./command-handler").CommandExecuteOutput, params: {
        agent?: string;
        variant?: string;
        providerId?: string;
        modelId?: string;
    }) => Promise<unknown>;
}): (input: unknown, output: unknown) => Promise<unknown>;
export declare function createToolExecuteAfterHook(args: {
    db: Parameters<typeof getOrCreateSessionMeta>[0];
    recentReduceBySession: RecentReduceBySession;
    toolUsageSinceUserTurn: ToolUsageSinceUserTurn;
}): (input: unknown) => Promise<void>;
//# sourceMappingURL=hook-handlers.d.ts.map