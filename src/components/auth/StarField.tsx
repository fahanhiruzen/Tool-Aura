// Exact path extracted from PluginLogo.tsx (38×38 coordinate space).
// Bounding box: x ≈ 13.18–24.82, y ≈ 11.92–22.16 → centre ≈ (19, 17.04)
// Symbol viewBox "12 10 14 14" frames it in a square with even padding.
export const MERCEDES_STAR_PATH =
  "M18.7175 12.2401L17.8554 18.023L13.3094 21.6648C13.2542 21.7961 13.2095 21.9317 13.1758 22.0703" +
  "C13.3103 22.1166 13.45 22.1458 13.5917 22.157L18.9991 20.0159L24.4086 22.1599" +
  "C24.55 22.1487 24.6895 22.1195 24.8238 22.0732C24.7962 21.933 24.7516 21.7968 24.6909 21.6677" +
  "L20.1442 18.0245L19.2821 12.2416C19.2016 12.1228 19.1065 12.0147 18.9991 11.9199" +
  "C18.8926 12.0147 18.798 12.1223 18.7175 12.2401Z";

const STARS = [
  // x    y    size  opacity  initRot  spinDur(s)
  // ── tiny peripheral ──
  [  14,  52,   5,  0.08,   35, 22],
  [  42,  28,   4,  0.07,  120, 28],
  [ 285,  44,   5,  0.08,  200, 25],
  [ 302,  98,   4,  0.07,   80, 30],
  [  18, 390,   5,  0.09,   15, 24],
  [ 292, 374,   6,  0.08,  160, 21],
  [  60, 438,   5,  0.07,  220, 26],
  [ 262, 428,   5,  0.08,  310, 27],
  [ 160,  22,   6,  0.08,   55, 19],
  // ── small ──
  [  74,  90,   9,  0.14,   10, 20],
  [ 240,  70,   8,  0.13,   55, 22],
  [  30, 155,   8,  0.12,  100, 18],
  [ 285, 165,   9,  0.13,  270, 20],
  [  95, 232,   8,  0.12,  330, 19],
  [ 220, 238,   9,  0.14,  195, 21],
  [ 160,  58,  10,  0.16,   70, 17],
  [ 165, 408,   9,  0.14,  150, 22],
  [  54, 310,   8,  0.13,  245, 18],
  [ 268, 295,   9,  0.14,   25, 20],
  // ── medium ──
  [ 112, 142,  14,  0.26,   20, 15],
  [ 208, 128,  13,  0.24,  340, 17],
  [  60, 172,  12,  0.20,   80, 16],
  [ 255, 152,  12,  0.22,  250, 14],
  [ 132, 198,  13,  0.24,  130, 16],
  [ 186, 210,  12,  0.22,   40, 18],
  [  78, 338,  12,  0.20,  165, 15],
  [ 244, 325,  13,  0.23,  305, 16],
  // ── large bright centre ──
  [ 160, 215,  26,  0.52,    0, 10],
  [ 120, 160,  18,  0.40,  115, 12],
  [ 202, 152,  20,  0.46,  230, 11],
  [ 148, 105,  16,  0.35,  180, 13],
  [ 172, 192,  17,  0.38,  295, 11],
  [  88, 195,  15,  0.30,   60, 14],
  [ 230, 195,  15,  0.32,  175, 13],
] as const;

// ─────────────────────────────────────────────────────────────
// Button spinner — static ring + spinning exact star
// ─────────────────────────────────────────────────────────────
export function MercedesStarSpinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <defs>
        <symbol id="spinner-star" viewBox="12 10 14 14">
          <path d={MERCEDES_STAR_PATH} fill="currentColor" />
        </symbol>
        <style>{`
          @keyframes mercedesStarSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </defs>
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.25" />
      <g style={{ transformOrigin: "10px 10px", animation: "mercedesStarSpin 1.6s linear infinite" }}>
        <use href="#spinner-star" x="3" y="3" width="14" height="14" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Animated star field background (theme-aware: dark = white stars, light = subtle dark stars)
// ─────────────────────────────────────────────────────────────
export function StarField() {
  return (
    <div
      className="absolute inset-0 pointer-events-none text-foreground/50 dark:text-white"
      aria-hidden
    >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 480"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <symbol id="bg-star" viewBox="12 10 14 14">
          <path d={MERCEDES_STAR_PATH} fill="currentColor" />
        </symbol>

        <radialGradient id="vignette-dark" cx="50%" cy="45%" r="75%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id="vignette-light" cx="50%" cy="45%" r="75%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.35" />
        </radialGradient>

        <style>{`
          @keyframes bgStarSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </defs>

      {STARS.map(([x, y, size, opacity, initRot, spinDur], i) => (
        <g key={i} transform={`translate(${x}, ${y}) rotate(${initRot})`} opacity={opacity}>
          <g style={{
            transformOrigin: "0px 0px",
            animation: `bgStarSpin ${spinDur}s linear infinite`,
            animationDelay: `-${((i * 1.7) % spinDur).toFixed(2)}s`,
          }}>
            <use href="#bg-star" x={-size / 2} y={-size / 2} width={size} height={size} />
          </g>
        </g>
      ))}

      <rect width="320" height="480" fill="url(#vignette-light)" className="dark:opacity-0" />
      <rect width="320" height="480" fill="url(#vignette-dark)" className="opacity-0 dark:opacity-100" />
    </svg>
    </div>
  );
}
