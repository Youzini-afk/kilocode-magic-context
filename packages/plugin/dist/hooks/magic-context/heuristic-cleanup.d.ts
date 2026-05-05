import type { ContextDatabase } from "../../features/magic-context/storage";
import type { TagEntry } from "../../features/magic-context/types";
import { type CavemanCleanupConfig } from "./caveman-cleanup";
import type { MessageLike, TagTarget } from "./tag-messages";
export declare function applyHeuristicCleanup(sessionId: string, db: ContextDatabase, targets: Map<number, TagTarget>, messageTagNumbers: Map<MessageLike, number>, config: {
    autoDropToolAge: number;
    dropToolStructure: boolean;
    protectedTags: number;
    dropAllTools?: boolean;
    /**
     * Age-tier caveman text compression settings. Only honored when the
     * session is running with ctx_reduce_enabled=false — caller is
     * responsible for zeroing this out when ctx_reduce is on.
     */
    caveman?: CavemanCleanupConfig;
}, preloadedTags?: TagEntry[]): {
    droppedTools: number;
    deduplicatedTools: number;
    droppedInjections: number;
    compressedTextTags: number;
};
//# sourceMappingURL=heuristic-cleanup.d.ts.map