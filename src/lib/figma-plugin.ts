/**
 * Ask the Figma plugin to resize the UI (minimize to 70x70 or restore to full size).
 */
export function sendPluginResize(type: "minimize" | "maximize") {
  try {
    window.parent.postMessage({ pluginMessage: { type } }, "*");
  } catch {
    // not in plugin iframe
  }
}
