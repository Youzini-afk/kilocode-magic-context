export interface KiloRuntimeInfo {
    app?: string;
    paths?: {
        config?: string;
        data?: string;
        cache?: string;
        state?: string;
        log?: string;
    };
    database?: {
        path?: string;
    };
}
export declare function setKiloRuntimeInfo(input: unknown): void;
export declare function getDataDir(): string;
export declare function getConfigDir(): string;
export declare function getCacheDir(): string;
export declare function getStateDir(): string;
export declare function getKiloDataDir(): string;
export declare function getKiloConfigDir(): string;
export declare function getKiloCacheDir(): string;
export declare function getKiloStateDir(): string;
export declare function getKiloLogDir(): string;
export declare function getKiloDbPath(): string;
export declare function getKiloStorageDir(): string;
/**
 * Resolve Kilo Magic Context's storage directory.
 *
 * Kilo data intentionally does not share the original OpenCode/Pi
 * cortexkit/magic-context database. Users can run the explicit migration CLI
 * when they want to import an older OpenCode database.
 *
 * Layout: <Kilo data>/storage/plugin/kilocode-magic-context/
 */
export declare function getMagicContextStorageDir(): string;
/**
 * Legacy magic-context storage directory used by the OpenCode plugin before the
 * shared cortexkit path. Used only for one-time migration of existing data into
 * the new shared location. The legacy directory is left in place after copy so
 * users can roll back if needed; manual cleanup is safe after one stable
 * release.
 */
export declare function getLegacyOpenCodeMagicContextStorageDir(): string;
export declare function getLegacyOpenCodeStoragePluginDir(): string;
//# sourceMappingURL=data-path.d.ts.map