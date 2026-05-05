interface AutoUpdateInstallContext {
    installDir: string;
    packageJsonPath: string;
}
export declare function resolveInstallContext(runtimePackageJsonPath?: string | null): AutoUpdateInstallContext | null;
export declare function preparePackageUpdate(version: string, packageName?: string, runtimePackageJsonPath?: string | null): string | null;
export declare function runBunInstallSafe(installDir: string, options?: {
    timeoutMs?: number;
    signal?: AbortSignal;
}): Promise<boolean>;
export {};
//# sourceMappingURL=cache.d.ts.map