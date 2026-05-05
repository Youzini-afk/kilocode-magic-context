export declare function createEventHandler(args: {
    magicContext: {
        event?: (input: {
            event: import("@kilocode/sdk").Event;
        }) => Promise<void>;
    } | null;
    autoUpdateChecker?: ((input: {
        event: import("@kilocode/sdk").Event;
    }) => Promise<void>) | null;
}): (input: {
    event: import("@kilocode/sdk").Event;
}) => Promise<void>;
//# sourceMappingURL=event.d.ts.map