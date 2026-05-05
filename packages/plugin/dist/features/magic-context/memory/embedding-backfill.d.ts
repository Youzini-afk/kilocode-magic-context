import type { Database } from "../../../shared/sqlite";
import type { Memory } from "./types";
export declare function ensureMemoryEmbeddings(args: {
    db: Database;
    memories: Memory[];
    existingEmbeddings: Map<number, Float32Array>;
}): Promise<Map<number, Float32Array>>;
//# sourceMappingURL=embedding-backfill.d.ts.map