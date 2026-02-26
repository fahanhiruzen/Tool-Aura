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

const buildOptions = {
  entryPoints: [join(root, "main", "code.ts")],
  bundle: true,
  outfile: join(distDir, "code.js"),
  format: "iife",
  globalName: "__plugin__",
  platform: "neutral",
  target: "es6",
  external: ["figma"],
  define: {
    __html__: JSON.stringify(getUiHtml()),
  },
  logLevel: "info",
};

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching main/ — plugin will rebuild on save. Reload plugin in Figma to see changes.");
} else {
  await esbuild.build(buildOptions);
  console.log("Plugin built: dist/code.js");
}
