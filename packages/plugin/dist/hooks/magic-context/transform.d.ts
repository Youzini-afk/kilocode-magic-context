import type { Scheduler } from "../../features/magic-context/scheduler";
import { type ContextDatabase, type getTopNBySize } from "../../features/magic-context/storage";
import type { Tagger } from "../../features/magic-context/tagger";
import type { ContextUsage, TagEntry } from "../../features/magic-context/types";
import type { PluginContext } from "../../plugin/types";
import type { NudgePlacementStore } from "./nudge-placement-store";
import type { ContextNudge } from "./nudger";
export { createNudgePlacementStore, type NudgePlacementStore } from "./nudge-placement-store";
import type { LiveModelBySession } from "./hook-handlers";
export declare function clearMessageTokensCache(sessionId: string, messageId?: string): void;
/**
 * Test-only accessor that returns (and lazily creates) the per-session token
 * cache map so tests can seed and inspect entries without running the full
 * transform pipeline. Not exported from any barrel.
 */
export declare function __getMessageTokensCacheForTest(sessionId: string): Map<string, {
    conversation: number;
    toolCall: number;
}>;
export interface TransformDeps {
    tagger: Tagger;
    scheduler: Scheduler;
    contextUsageMap: Map<string, {
        usage: ContextUsage;
        updatedAt: number;
    }>;
    nudger: (sessionId: string, contextUsage: ContextUsage, db: ContextDatabase, topNFn: typeof getTopNBySize, preloadedTags?: TagEntry[], messagesSinceLastUser?: number, preloadedSessionMeta?: import("../../features/magic-context/types").SessionMeta) => ContextNudge | null;
    db: ContextDatabase;
    nudgePlacements: NudgePlacementStore;
    protectedTags: number;
    /**
     * Primary-session ctx_reduce setting. When false, tag prefix injection is
     * skipped for ALL sessions (primary + subagent). When true, primary sessions
     * get prefixes but subagent sessions still skip (subagents are always
     * treated as ctx_reduce_enabled=false). See tag-messages.ts for the gate.
     * Defaults to true when omitted (preserves legacy behavior for tests).
     */
    ctxReduceEnabled?: boolean;
    autoDropToolAge: number;
    dropToolStructure?: boolean;
    clearReasoningAge: number;
    /**
     * One-shot signal that `<session-history>` injection cache is stale and
     * `prepareCompartmentInjection` should rebuild on this pass. Drained
     * after the rebuild so subsequent defer passes hit the fresh cache.
     * See Oracle review 2026-04-26 for the three-set split rationale.
     */
    historyRefreshSessions: Set<string>;
    /**
     * Persistent signal that pending ops + heuristics need to materialize.
     * Survives across defer passes when `compartmentRunning` blocks the
     * heuristic pass. Drained only after `shouldRunHeuristics` succeeds.
     */
    pendingMaterializationSessions: Set<string>;
    lastHeuristicsTurnId: Map<string, string>;
    commitSeenLastPass?: Map<string, boolean>;
    client?: PluginContext["client"];
    directory?: string;
    memoryConfig?: {
        enabled: boolean;
        injectionBudgetTokens: number;
        /** When true, historian/recomp auto-promote eligible session facts
         *  to project memories. When false, promotion is skipped — agents can
         *  still write memories explicitly via `ctx_memory write`. Issue #44. */
        autoPromote: boolean;
    };
    /**
     * Returns the historian chunk budget. Called at each historian spawn site
     * so the value is always derived from current config — keeping hook,
     * RPC, and TUI trigger paths consistent and honoring runtime config changes.
     * Optional for tests; production (hook.ts) always provides it.
     */
    getHistorianChunkTokens?: () => number;
    historyBudgetPercentage?: number;
    executeThresholdPercentage?: number | {
        default: number;
        [modelKey: string]: number;
    };
    executeThresholdTokens?: {
        default?: number;
        [modelKey: string]: number | undefined;
    };
    historianTimeoutMs?: number;
    getNotificationParams?: (sessionId: string) => import("./send-session-notification").NotificationParams;
    getModelKey?: (sessionId: string) => string | undefined;
    getFallbackModelId?: (sessionId: string) => string | undefined;
    projectPath?: string;
    experimentalCompactionMarkers?: boolean;
    experimentalUserMemories?: boolean;
    /** When true, inject wall-clock gap markers (<!-- +Xm -->) on user messages and
     *  add start/end date attributes to <compartment> elements in <session-history>.
     *  Controlled by `experimental.temporal_awareness` config. */
    experimentalTemporalAwareness?: boolean;
    /** When true, run a second editor pass after historian to clean U: lines.
     *  Enables the historian-editor agent. Controlled by `historian.two_pass` config. */
    historianTwoPass?: boolean;
    /** Compressor floor ratio: floor = ceil(lastEndMessage / minCompartmentRatio).
     *  Controlled by `compressor.min_compartment_ratio` config. */
    compressorMinCompartmentRatio?: number;
    /** Compressor max merge depth (1-5). Controlled by `compressor.max_merge_depth` config. */
    compressorMaxMergeDepth?: number;
    /** Compressor cooldown in milliseconds. Controlled by `compressor.cooldown_ms` config. */
    compressorCooldownMs?: number;
    liveModelBySession?: LiveModelBySession;
    /** Experimental auto-search hint — transform-time ctx_search on each new
     *  user message; when top hit clears the threshold, append a compact
     *  fragment hint to the user message. Controlled by
     *  `experimental.auto_search.*` config. */
    autoSearch?: {
        enabled: boolean;
        scoreThreshold: number;
        minPromptChars: number;
        memoryEnabled: boolean;
        embeddingEnabled: boolean;
        gitCommitsEnabled: boolean;
    };
    /**
     * Experimental age-tier caveman text compression — rewrites long
     * user/assistant text parts with progressively aggressive caveman
     * rules based on their position in the eligible tag window. Only
     * honored when `ctx_reduce_enabled: false` (transform zeroes this
     * out when ctx_reduce is on so the postprocess path stays unaware).
     */
    cavemanTextCompression?: {
        enabled: boolean;
        minChars: number;
    };
}
export declare function createTransform(deps: TransformDeps): (_input: Record<string, never>, output: {
    messages: unknown[];
}) => Promise<void>;
//# sourceMappingURL=transform.d.ts.map