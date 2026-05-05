/**
 * Historian state-file offloading.
 *
 * When the existing-state XML (prior compartments + facts + project memory)
 * exceeds {@link HISTORIAN_STATE_INLINE_THRESHOLD} characters, the historian
 * caller writes it to a temp file under {@link HISTORIAN_STATE_DIR} and the
 * prompt instructs the model to `Read this file first`. This avoids pushing
 * 100K+ chars of inline reference state through the model's input on long
 * sessions, which on some provider/model combinations (notably
 * github-copilot/gpt-5.4 via the openai-responses API) causes the model to
 * stall before emitting any output tokens.
 *
 * The caller MUST delete the file in finally{} via
 * {@link cleanupHistorianStateFile}.
 *
 * Shared between OpenCode (`compartment-runner-incremental.ts`,
 * `compartment-runner-recomp.ts`) and Pi (`pi-historian-runner.ts`).
 */
export declare const HISTORIAN_STATE_INLINE_THRESHOLD = 30000;
export declare const HISTORIAN_STATE_DIR: string;
/**
 * When existingState is large, write it to a temp file and return the path.
 * Returns undefined when existingState is small enough to inline OR when
 * writing fails (in which case the caller should fall back to inline).
 */
export declare function maybeWriteHistorianStateFile(sessionId: string, existingState: string): string | undefined;
/** Delete a previously written state file. Safe to call with undefined. */
export declare function cleanupHistorianStateFile(path: string | undefined): void;
//# sourceMappingURL=historian-state-file.d.ts.map