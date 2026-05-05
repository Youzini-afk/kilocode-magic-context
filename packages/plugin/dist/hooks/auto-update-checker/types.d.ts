import { z } from "zod";
export declare const NpmPackageEnvelopeSchema: z.ZodObject<{
    "dist-tags": z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
}, z.core.$strip>;
export declare const KiloPluginTupleSchema: z.ZodTuple<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>], null>;
export declare const KiloConfigSchema: z.ZodObject<{
    plugin: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodTuple<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>], null>]>>>;
}, z.core.$strip>;
export declare const PackageJsonSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$loose>;
export interface AutoUpdateCheckerOptions {
    enabled?: boolean;
    showStartupToast?: boolean;
    autoUpdate?: boolean;
    npmRegistryUrl?: string;
    fetchTimeoutMs?: number;
    signal?: AbortSignal;
}
export interface PluginEntryInfo {
    entry: string;
    isPinned: boolean;
    pinnedVersion: string | null;
    configPath: string;
}
export type NpmPackageEnvelope = z.infer<typeof NpmPackageEnvelopeSchema>;
export type KiloConfig = z.infer<typeof KiloConfigSchema>;
export type PackageJson = z.infer<typeof PackageJsonSchema>;
//# sourceMappingURL=types.d.ts.map