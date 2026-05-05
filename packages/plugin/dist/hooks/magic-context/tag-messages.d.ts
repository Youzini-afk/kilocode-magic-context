import type { ContextDatabase } from "../../features/magic-context/storage";
import type { Tagger } from "../../features/magic-context/tagger";
import { type ToolCallIndex, type ToolDropResult, ToolMutationBatch } from "./tool-drop-target";
export type MessageInfo = {
    id?: string;
    role?: string;
    sessionID?: string;
};
export interface ThinkingLikePart {
    type: string;
    thinking?: string;
    text?: string;
}
export type MessageLike = {
    info: MessageInfo;
    parts: unknown[];
};
export type TagTarget = {
    setContent: (content: string) => boolean;
    getContent?: () => string | null;
    drop?: () => ToolDropResult;
    truncate?: () => ToolDropResult;
    message?: MessageLike;
};
export interface TagMessagesResult {
    targets: Map<number, TagTarget>;
    reasoningByMessage: Map<MessageLike, ThinkingLikePart[]>;
    messageTagNumbers: Map<MessageLike, number>;
    toolCallIndex: ToolCallIndex;
    batch: ToolMutationBatch;
    hasRecentReduceCall: boolean;
    /** Whether recent assistant messages contain git commit hash patterns */
    hasRecentCommit: boolean;
}
export interface TagMessagesOptions {
    /**
     * When true, skip injecting §N§ prefix into message text/tool output parts.
     * DB-level tag records are still created normally — this flag only affects
     * whether the agent-visible part content gets the tag prefix. Used when
     * `ctx_reduce_enabled: false` so agents don't see tag markers they can't
     * act on. Subagents also set this flag (they are always treated as
     * ctx_reduce_enabled=false). Cache-safe: skipping is consistent across
     * passes, so message shape stays stable.
     */
    skipPrefixInjection?: boolean;
}
export declare function tagMessages(sessionId: string, messages: MessageLike[], tagger: Tagger, db: ContextDatabase, options?: TagMessagesOptions): TagMessagesResult;
//# sourceMappingURL=tag-messages.d.ts.map