import { useState } from "react";
import { Lock, AlertCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStateCode, getRefreshToken, handleAllowFigmaPermission } from "@/api/auth";
import { getCurrentUser } from "@/api/user";
import { isAllowedEmail } from "@/config/allowed-users";
import { useAuthStore, persistCddbTokenToFigma } from "@/stores/auth-store";
import { useCurrentCDDBUserStore } from "@/stores/current-user-store";
import { useFigmaDataStore } from "@/stores/figma-data-store";
import { cn } from "@/lib/utils";
import { PluginLogo } from "@/components/auth/PluginLogo";

type RocketState = "idle" | "preparing" | "launching";

export function LoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rocketState, setRocketState] = useState<RocketState>("idle");

  const setCurrentCDDBUser = useCurrentCDDBUserStore((s) => s.setCurrentUser);
  const userIdFromAuth = useAuthStore((s) => s.userId);
  const figmaData = useFigmaDataStore((s) => s.data);
  const userId = userIdFromAuth ?? figmaData?.user?.id ?? null;
  const figmaUserName = figmaData?.user?.name;

  const loading = rocketState !== "idle";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = token.trim();
    if (!value) { setError("Please enter a token."); return; }
    if (!userId) {
      setError(
        figmaData && !figmaData.user
          ? "Please log in to Figma to use this plugin."
          : "Please wait for the plugin to connect…"
      );
      return;
    }

    setError(null);
    setRocketState("preparing");

    // If we need to trigger navigation via setCddbToken, defer it until after animation
    let pendingCddbToken: string | null = null;

    try {
      if (!figmaData?.figmaToken) {
        const stateCode = await getStateCode(userId, value);
        handleAllowFigmaPermission(stateCode.state);
        pendingCddbToken = value;
      }

      const user = await getCurrentUser(value);
      if (!isAllowedEmail(user.email)) {
        setError("You are not authorized to use this plugin. Only designated users can access it.");
        setRocketState("idle");
        return;
      }

      setCurrentCDDBUser(user);

      // Trigger launch animation
      setRocketState("launching");
      await new Promise((r) => setTimeout(r, 800));

      // Navigate — this triggers AuthGate to move to the next screen
      persistCddbTokenToFigma(value);
      if (pendingCddbToken) {
        useFigmaDataStore.getState().setCddbToken(pendingCddbToken);
      }
    } catch (err) {
      setRocketState("idle");
      setError(err instanceof Error ? err.message : "Invalid token. Please try again.");
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background">
      <style>{`
        @keyframes rocketShake {
          0%, 100% { transform: rotate(-45deg) translate(0px,  0px); }
          30%       { transform: rotate(-48deg) translate(-1.5px, 1.5px); }
          70%       { transform: rotate(-42deg) translate( 1.5px,-1.5px); }
        }
        @keyframes smokeRise {
          0%   { opacity: 0.65; transform: scale(1) translate(0, 0); }
          100% { opacity: 0;    transform: scale(2.2) translate(0, 5px); }
        }
        @keyframes rocketLaunch {
          0%   { transform: translate(-50%, 0) rotate(-45deg) scale(1);   opacity: 1; }
          25%  { transform: translate(calc(-50% + 18px), -22px) rotate(-48deg) scale(1.15); opacity: 1; }
          75%  { opacity: 0.7; }
          100% { transform: translate(calc(-50% + 280px), -110px) rotate(-42deg) scale(0.7); opacity: 0; }
        }
        @keyframes launchGlow {
          0%, 100% { opacity: 0; }
          40%, 60% { opacity: 1; }
        }
      `}</style>

      {/* top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-8">

        {/* ── branding ── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="absolute -inset-2.5 rounded-2xl bg-primary/6 dark:bg-primary/10" />
            <div className="relative rounded-[10px] ring-1 ring-black/8 dark:ring-white/15">
              <PluginLogo />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              {figmaUserName ? `Welcome, ${figmaUserName.split(" ")[0]}` : "Sign in"}
            </h1>
            <p className="max-w-[210px] text-[11px] leading-relaxed text-muted-foreground">
              Paste your access token below to connect to the plugin
            </p>
          </div>
        </div>

        {/* ── form card ── */}
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
        >
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Lock className="h-3 w-3" />
              Access Token
            </label>
            <textarea
              placeholder="Paste your JWT token here…"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(null); }}
              rows={4}
              autoFocus
              disabled={loading}
              aria-label="Access token"
              className={cn(
                "flex w-full rounded-lg border bg-background/60 px-3 py-2.5 text-[11px] font-mono leading-relaxed shadow-inner transition-all resize-none",
                "placeholder:text-muted-foreground/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error
                  ? "border-destructive/50 focus-visible:ring-destructive/25"
                  : "border-input focus-visible:border-ring"
              )}
            />
            {error && (
              <div className="flex items-start gap-1.5 pt-0.5">
                <AlertCircle className="mt-px h-3 w-3 shrink-0 text-destructive" />
                <p className="text-[11px] leading-snug text-destructive" role="alert">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* ── rocket launch pad + button ── */}
          <div className="relative">

            {/* Rocket zone — sits on top of the button */}
            <div className="relative h-7 flex items-end justify-center pointer-events-none overflow-visible">

              {/* Preparing: rocket shakes with smoke below */}
              {rocketState === "preparing" && (
                <div className="flex flex-col items-center gap-0.5 mb-0.5">
                  <Rocket
                    className="h-[18px] w-[18px] text-primary"
                    style={{ animation: "rocketShake 0.1s ease-in-out infinite" }}
                  />
                  {/* exhaust smoke */}
                  <div className="flex gap-[3px]">
                    {[0, 0.1, 0.2].map((delay, i) => (
                      <span
                        key={i}
                        className="h-[5px] w-[5px] rounded-full bg-muted-foreground/50"
                        style={{ animation: `smokeRise 0.42s ease-out ${delay}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Launching: rocket flies right */}
              {rocketState === "launching" && (
                <>
                  {/* brief glow under launch site */}
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-4 w-12 rounded-full bg-primary/30 blur-sm"
                    style={{ animation: "launchGlow 0.8s ease-out forwards" }}
                  />
                  <Rocket
                    className="absolute bottom-1 text-primary"
                    style={{
                      left: "50%",
                      width: 20,
                      height: 20,
                      animation: "rocketLaunch 0.75s cubic-bezier(0.4,0,0.8,1) forwards",
                    }}
                  />
                </>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              className="w-full"
              disabled={loading}
            >
              {rocketState === "idle"      && "Connect"}
              {rocketState === "preparing" && "Preparing…"}
              {rocketState === "launching" && "Launching…"}
            </Button>
          </div>
        </form>

        {/* ── help ── */}
        <p className="text-center text-[11px] text-muted-foreground/70">
          Need a new token?{" "}
          <button
            type="button"
            onClick={getRefreshToken}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Reopen browser tab
          </button>
        </p>

      </div>
    </div>
  );
}
