import type { Database } from "../../shared/sqlite";
import type { TagEntry } from "./types";
/**
 * Bump a tag's byte_size when a later occurrence of the same call_id
 * carries a larger payload. Used by `tagTranscript` to record the
 * tool-result payload size after the tool-use invocation already
 * reserved the tag with the args size.
 *
 * No-op if newByteSize is not strictly larger than the stored value
 * (caller should compare in memory and only call when necessary).
 */
export declare function updateTagByteSize(db: Database, sessionId: string, tagNumber: number, newByteSize: number): void;
/**
 * Bump a tag's input_byte_size when a tool_use occurrence is seen
 * after the result occurrence (rare in practice; supports both
 * orderings).
 */
export declare function updateTagInputByteSize(db: Database, sessionId: string, tagNumber: number, newInputByteSize: number): void;
export declare function insertTag(db: Database, sessionId: string, messageId: string, type: TagEntry["type"], byteSize: number, tagNumber: number, reasoningByteSize?: number, toolName?: string | null, inputByteSize?: number): number;
export declare function updateTagStatus(db: Database, sessionId: string, tagId: number, status: TagEntry["status"]): void;
export declare function updateTagDropMode(db: Database, sessionId: string, tagNumber: number, dropMode: TagEntry["dropMode"]): void;
/**
 * Set the caveman compression depth for a tag.
 *
 * Only message tags are expected to receive non-zero depth; callers enforce
 * that. Persisted so later transform passes and restarts can resume without
 * re-compressing text that already matches its target age-tier depth.
 */
export declare function updateCavemanDepth(db: Database, sessionId: string, tagNumber: number, depth: number): void;
export declare function updateTagMessageId(db: Database, sessionId: string, tagId: number, messageId: string): void;
export declare function deleteTagsByMessageId(db: Database, sessionId: string, messageId: string): number[];
export declare function getMaxTagNumberBySession(db: Database, sessionId: string): number;
/**
 * Look up the tag_number assigned to a specific (session_id, message_id).
 *
 * Used by the tagger's recovery path to bind an existing DB-assigned tag back
 * into the in-memory assignment map without bumping the counter past the DB's
 * actual max. Returns null when no tag exists for that message yet.
 */
export declare function getTagNumberByMessageId(db: Database, sessionId: string, messageId: string): number | null;
export declare function getTagsBySession(db: Database, sessionId: string): TagEntry[];
export declare function getTagById(db: Database, sessionId: string, tagId: number): TagEntry | null;
export declare function getTopNBySize(db: Database, sessionId: string, n: number): TagEntry[];
//# sourceMappingURL=storage-tags.d.ts.map