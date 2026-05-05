import type { Database } from "../../../shared/sqlite";
export interface DreamQueueEntry {
    id: number;
    /** Project identity (e.g. "git:<sha>"), NOT a filesystem path */
    projectIdentity: string;
    reason: string;
    enqueuedAt: number;
    startedAt: number | null;
}
export declare function ensureDreamQueueTable(db: Database): void;
/** Enqueue a project for dreaming. Skips if the same project already has any queue entry (queued or running).
 *
 * @param force - When true (e.g. manual /ctx-dream), uses the lease TTL (2 min) as the stale threshold
 *   instead of the full 2-hour max-runtime window. This lets users re-trigger dreaming after a crash or
 *   restart even when the previous queue entry was started only seconds ago.
 */
export declare function enqueueDream(db: Database, projectIdentity: string, reason: string, force?: boolean): DreamQueueEntry | null;
/** Peek at the next unstarted entry without claiming it. */
export declare function peekQueue(db: Database): DreamQueueEntry | null;
/** Claim the next unstarted entry atomically by marking started_at. Returns null if queue is empty. */
export declare function dequeueNext(db: Database): DreamQueueEntry | null;
/** Remove a completed or failed entry from the queue. */
export declare function removeDreamEntry(db: Database, id: number): void;
/** Reset a dequeued entry so it can be retried (e.g., after lease failure). Increments retry_count. */
export declare function resetDreamEntry(db: Database, id: number): void;
/** Get the retry count for a queue entry. */
export declare function getEntryRetryCount(db: Database, id: number): number;
/** Clear stale started entries (stuck for more than maxAgeMs). */
export declare function clearStaleEntries(db: Database, maxAgeMs: number): number;
//# sourceMappingURL=queue.d.ts.map