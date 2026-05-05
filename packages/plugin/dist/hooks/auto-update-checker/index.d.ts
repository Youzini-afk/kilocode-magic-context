import type { PluginInput } from "@kilocode/plugin";
import type { AutoUpdateCheckerOptions } from "./types";
type KiloEvent = {
    type: string;
    properties?: unknown;
};
export declare function createAutoUpdateCheckerHook(ctx: PluginInput, options?: AutoUpdateCheckerOptions): ({ event }: {
    event: KiloEvent;
}) => Promise<void>;
export declare function getAutoUpdateInstallDir(): string;
export type { AutoUpdateCheckerOptions } from "./types";
//# sourceMappingURL=index.d.ts.map