import { type SessionChunkLine } from "./read-session-formatting";
import { type RawMessage } from "./read-session-raw";
export { extractTexts, hasMeaningfulUserText } from "./read-session-formatting";
/**
 * Per-session source override for raw message reading.
 *
 * The default implementation of `readRawSessionMessages(sessionId)` reads
 * from OpenCode's session DB via `withReadOnlySessionDb`. Other harnesses
 * (e.g. Pi) provide their session data through a different surface
 * (`pi.sessionManager.getBranch()`), so they register a per-session
 * provider here BEFORE invoking any code path that calls the shared
 * `readRawSessionMessages` / `getRawSessionMessageCount` /
 * `getProtectedTailStartOrdinal` / `readSessionChunk` helpers.
 *
 * The registry is lookup-by-sessionId: a registered provider takes
 * precedence over the OpenCode-DB default. Sessions never registered
 * here continue to read from OpenCode's DB (existing behavior).
 *
 * Lifecycle: providers should be registered for the duration of one
 * historian/trigger evaluation and unregistered afterward to avoid
 * leaking session state across unrelated plugin instances. The
 * `withSessionMessageProvider` helper enforces this by wrapping a
 * scope.
 */
export interface RawMessageProvider {
    readMessages(): RawMessage[];
    /** Optional fast count path; falls back to readMessages().length. */
    getMessageCount?: () => number;
}
/**
 * Register a per-session source for raw message reading. Returns an
 * unregister function. Pass-through harnesses (OpenCode) never call
 * this; only Pi/future harnesses install themselves before triggering
 * historian.
 */
export declare function setRawMessageProvider(sessionId: string, provider: RawMessageProvider): () => void;
/**
 * Run `fn` with a temporary per-session provider override. Cleans up
 * on return regardless of throw — preferred over manual
 * `setRawMessageProvider` / `cleanup()` pairs.
 */
export declare function withRawMessageProvider<T>(sessionId: string, provider: RawMessageProvider, fn: () => T): T;
/** Strip system-reminder blocks and OMO markers from user text for chunk compaction. */
export declare function cleanUserText(text: string): string;
export interface SessionChunk {
    startIndex: number;
    endIndex: number;
    startMessageId: string;
    endMessageId: string;
    messageCount: number;
    tokenEstimate: number;
    hasMore: boolean;
    text: string;
    lines: SessionChunkLine[];
    /** Number of distinct commit clusters — assistant blocks with commits separated by meaningful user turns */
    commitClusterCount: number;
    /**
     * Contiguous ranges of raw message ordinals whose visible chunk content was
     * tool-only (TC: lines, no narrative text). Historian frequently skips such
     * ranges entirely — that's safe, so validation absorbs gaps that fall fully
     * within these ranges regardless of size. Gaps outside these ranges still
     * fail validation and trigger a repair retry.
     */
    toolOnlyRanges: Array<{
        start: number;
        end: number;
    }>;
}
export declare function withRawSessionMessageCache<T>(fn: () => T): T;
export declare function readRawSessionMessages(sessionId: string): RawMessage[];
export declare function getRawSessionMessageCount(sessionId: string): number;
export declare function getRawSessionTagKeysThrough(sessionId: string, upToMessageIndex: number): string[];
export declare function getProtectedTailStartOrdinal(sessionId: string): number;
export declare function readSessionChunk(sessionId: string, tokenBudget: number, offset?: number, eligibleEndOrdinal?: number): SessionChunk;
export declare function getRawSessionMessageIdsThrough(sessionId: string, endOrdinal: number): string[];
//# sourceMappingURL=read-session-chunk.d.ts.map