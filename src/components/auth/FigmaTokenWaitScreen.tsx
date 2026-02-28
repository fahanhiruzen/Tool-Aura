import { useEffect, useState } from "react";
import { persistFigmaAccessTokenToFigma, useFigmaDataStore, usePluginStore } from "@/stores";
import { getStateCode, handleAllowFigmaPermission, getAccessToken } from "@/api/auth";
import { PluginLogo } from "./PluginLogo";
import { StarFieldBackdrop } from "./StarFieldBackdrop";

const TOTAL = 30;
const R = 54;
const CIRC = 2 * Math.PI * R;

export function FigmaTokenWaitScreen() {
  const [seconds, setSeconds] = useState(TOTAL);
  const cddbToken = useFigmaDataStore((x) => x.data?.cddbToken);
  const userId = useFigmaDataStore((x) => x.data?.user?.id);
  const setFigmaAccessToken = useFigmaDataStore((x) => x.setFigmaAccessToken);

  const isUrgent = seconds <= 5 && seconds > 0;
  const isDone   = seconds === 0;
  const isAlert  = isDone || isUrgent;

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  // Poll for the Figma access token every second while the timer is running
  useEffect(() => {
    if (!userId || isDone) return;
    const id = setInterval(async () => {
      try {
        const response = await getAccessToken(userId);
        if (response.accessToken) {
          setFigmaAccessToken(response.accessToken);
          persistFigmaAccessTokenToFigma(response.accessToken);
        }
      } catch {
        // token not yet available — try again next tick
      }
    }, 1000);
    return () => clearInterval(id);
  }, [userId, isDone, setFigmaAccessToken]);

  const dashOffset = CIRC * (1 - seconds / TOTAL);

  const handleTryAgain = async () => {
    setSeconds(TOTAL);
    try {
      const stateCode = await getStateCode(userId as string, cddbToken as string);
      handleAllowFigmaPermission(stateCode.state);
    } catch (err) {
      usePluginStore.getState().setNotification({
        message: err instanceof Error ? err.message : "Error getting state code. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <StarFieldBackdrop contentClassName="flex flex-col items-center justify-center gap-5 px-5 py-8 text-center w-full">
      <div className="flex flex-col items-center gap-5 w-full">
      {/* ── logo + progress ring ── */}
      <div className="relative flex items-center justify-center">
        <svg
          width={140} height={140}
          style={{ transform: "rotate(-90deg)" }}
          className={isAlert ? "" : "text-foreground"}
        >
          {/* track */}
          <circle
            cx={70} cy={70} r={R}
            fill="none" stroke="currentColor" strokeWidth={2.5}
            className="text-muted-foreground/20"
          />
          {/* progress arc */}
          <circle
            cx={70} cy={70} r={R}
            fill="none"
            stroke={isAlert ? "#ef4444" : "currentColor"}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.6s ease" }}
          />
        </svg>

        {/* center icon */}
        <div className="absolute flex items-center justify-center">
          
            <div className="rounded-[10px] ring-1 ring-white/15 bg-white/5 backdrop-blur-md">
              <PluginLogo />
            </div>
        </div>
      </div>

      {/* ── countdown ── */}
      <div className="flex flex-col items-center gap-0.5">
        {isDone ? (
          <span className="text-sm font-medium" style={{ color: "#ef4444" }}>
            Timed out
          </span>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <span
              className={`text-5xl font-light leading-none tabular-nums ${isAlert ? "" : "text-foreground"}`}
              style={isAlert ? { color: "#ef4444", transition: "color 0.6s ease" } : { transition: "color 0.6s ease" }}
            >
              {seconds}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              seconds
            </span>
          </div>
        )}
      </div>

      {/* ── message ── */}
      <div className="flex flex-col items-center gap-2 max-w-[280px]">
        {isDone ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-medium text-foreground">
              A tab has been opened in the browser.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
              Please “Allow Access” to continue.
              </p>
            </div>
            <button
              onClick={handleTryAgain}
              className="rounded-full border border-foreground/20 px-5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/5 active:bg-foreground/10"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              A tab has been opened in the browser
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Press{" "}
              <span className="font-medium text-foreground">Allow Access</span>
              {" "}in the browser tab
            </p>
          </div>
        )}
      </div>
      </div>
    </StarFieldBackdrop>
  );
}
