import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dir, "..");
const pluginPackage = await Bun.file(join(root, "packages", "plugin", "package.json")).json() as {
    version: string;
};
const version = pluginPackage.version;
const distDir = join(root, "dist");
const stageDir = join(distDir, `kilocode-magic-context-${version}`);
const zipPath = join(distDir, `kilocode-magic-context-${version}.zip`);

function copyIntoStage(source: string, target: string): void {
    const destination = join(stageDir, target);
    mkdirSync(resolve(destination, ".."), { recursive: true });
    copyFileSync(join(root, source), destination);
}

mkdirSync(distDir, { recursive: true });
rmSync(stageDir, { recursive: true, force: true });
rmSync(zipPath, { force: true });

copyIntoStage("README.md", "README.md");
copyIntoStage("package.json", "package.json");
copyIntoStage("assets/kilo-magic-context.schema.json", "assets/kilo-magic-context.schema.json");
copyIntoStage("packages/plugin/package.json", "packages/plugin/package.json");
copyIntoStage("packages/plugin/dist/index.js", "packages/plugin/dist/index.js");
copyIntoStage("packages/plugin/dist/index.d.ts", "packages/plugin/dist/index.d.ts");
copyIntoStage("packages/cli/package.json", "packages/cli/package.json");
copyIntoStage("packages/cli/dist/index.js", "packages/cli/dist/index.js");

if (process.platform === "win32") {
    const result = spawnSync(
        "powershell.exe",
        [
            "-NoProfile",
            "-Command",
            "& { param($source, $destination) Compress-Archive -Path $source -DestinationPath $destination -Force }",
            join(stageDir, "*"),
            zipPath,
        ],
        { stdio: "inherit" },
    );
    if (result.status !== 0) process.exit(result.status ?? 1);
} else {
    const result = spawnSync("zip", ["-qr", zipPath, "."], { cwd: stageDir, stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(zipPath)) {
    throw new Error(`Failed to create ${zipPath}`);
}

console.log(`Created ${zipPath}`);
