import { type MagicContextConfig } from "./schema/magic-context";
export interface MagicContextPluginConfig extends MagicContextConfig {
    disabled_hooks?: string[];
    command?: Record<string, {
        template: string;
        description?: string;
        agent?: string;
        model?: string;
        subtask?: boolean;
    }>;
}
export declare function loadPluginConfig(directory: string): MagicContextPluginConfig & {
    configWarnings?: string[];
};
export declare function getPluginConfigStatus(directory: string): {
    userConfig?: string;
    projectConfig?: string;
};
export declare function readPluginSettingsConfig(directory: string): {
    target: {
        scope: "user";
        path: string;
        exists: boolean;
        format: "json" | "jsonc";
        mtimeMs: number | null;
    };
    project: {
        path: string | null;
        exists: boolean;
        overriddenKeys: string[];
    };
    schemaUrl: string;
    raw: Record<string, unknown>;
    projectRaw: Record<string, unknown>;
    effective: MagicContextPluginConfig & {
        configWarnings?: string[];
    };
};
export declare function savePluginSettingsConfig(input: {
    directory: string;
    expectedMtimeMs?: number | null;
    config: Record<string, unknown>;
}): ReturnType<typeof readPluginSettingsConfig>;
//# sourceMappingURL=index.d.ts.map