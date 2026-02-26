import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Sync Figma editor theme → Tailwind dark class.
// When themeColors:true, Figma adds "figma-dark" / "figma-light" to <html>.
(function syncFigmaTheme() {
  let lastIsDark: boolean | null = null;

  const apply = () => {
    const isDark = document.documentElement.classList.contains("figma-dark");
    if (isDark === lastIsDark) return;
    lastIsDark = isDark;
    document.documentElement.classList.toggle("dark", isDark);
  };

  apply();

  new MutationObserver(apply).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
})();

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
