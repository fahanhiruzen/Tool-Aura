#!/usr/bin/env node
/**
 * Bundles the Figma plugin from main/code.ts into dist/code.js (manifest main).
 * Injects the UI HTML so __html__ is defined when the plugin runs.
 * Run: npm run build:plugin
 * Watch: npm run watch:plugin (rebuilds on save under main/)
 */
import * as esbuild from "esbuild";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, existsSync, readFileSync } from "fs";

const watch = process.argv.includes("--watch");
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname);
const distDir = join(root, "dist");

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

function getUiHtml() {
  const uiPath = existsSync(join(distDir, "index.html"))
    ? join(distDir, "index.html")
    : join(root, "index.html");
  if (uiPath.includes("index.html") && !uiPath.includes("dist")) {
    console.warn("Warning: using root index.html. Run 'npm run build' first so dist/index.html is used.");
  }
  let html = readFileSync(uiPath, "utf-8");

  // So script/styles load in Figma's iframe: use paths relative to plugin root (dist/assets/...)
  html = html.replace(/(href|src)=["']\/assets\//g, '$1="dist/assets/');

  // Reduce permissions policy violations in console (Figma iframe restricts these anyway)
  const policyMeta =
    '<meta name="Permissions-Policy" content="camera=(), microphone=(), clipboard-write=(), display-capture=()">';
  if (!html.includes("Permissions-Policy")) {
    html = html.replace("<head>", `<head>${policyMeta}`);
  }

  return html;
}

const baseBuildOptions = {
  entryPoints: [join(root, "main", "code.ts")],
  bundle: true,
  outfile: join(distDir, "code.js"),
  format: "iife",
  globalName: "__plugin__",
  platform: "neutral",
  target: "es6",
  external: ["figma"],
  logLevel: "info",
};

function getBuildOptions() {
  return {
    ...baseBuildOptions,
    define: { __html__: JSON.stringify(getUiHtml()) },
  };
}

async function rebuild(label) {
  try {
    await esbuild.build(getBuildOptions());
    console.log(`[${new Date().toLocaleTimeString()}] Rebuilt (${label}) — reload plugin in Figma`);
  } catch {
    // esbuild already prints the error
  }
}

if (watch) {
  const { build: viteBuild } = await import("vite");
  const { watch: chokidarWatch } = await import("chokidar");

  // Initial plugin build before anything starts
  await esbuild.build(getBuildOptions());
  console.log("Plugin built. Watching src/ and main/ for changes…");

  let firstViteBuild = true;

  // Run vite in watch mode. The closeBundle hook fires AFTER vite finishes
  // writing all output files, so we can safely re-read dist/index.html.
  viteBuild({
    configFile: join(root, "vite.config.ts"),
    build: { watch: {} },
    plugins: [
      {
        name: "figma-plugin-rebuild",
        async closeBundle() {
          if (firstViteBuild) {
            firstViteBuild = false;
            return; // skip the initial vite build — already done above
          }
          await rebuild("src/");
        },
      },
    ],
  });

  // Watch main/ TS files separately (vite doesn't touch these)
  chokidarWatch(join(root, "main"), {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 150 },
  }).on("all", (_e, file) => {
    rebuild(file.replace(root + "/", ""));
  });
} else {
  await esbuild.build(getBuildOptions());
  console.log("Plugin built: dist/code.js");
}
