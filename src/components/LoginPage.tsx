import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStateCode, getRefreshToken, handleAllowFigmaPermission } from "@/api/auth";
import { getCurrentUser } from "@/api/user";
import { isAllowedEmail } from "@/config/allowed-users";
import { useAuthStore, persistCddbTokenToFigma } from "@/stores/auth-store";
import { useCurrentCDDBUserStore } from "@/stores/current-user-store";
import { useFigmaDataStore } from "@/stores/figma-data-store";
import { cn } from "@/lib/utils";
import { PluginLogo } from "@/components/auth/PluginLogo";
import { StarFieldBackdrop } from "@/components/auth/StarFieldBackdrop";
import { MercedesStarSpinner } from "@/components/auth/StarField";

// JWT = three base64url segments separated by dots
const JWT_SEGMENT_REGEX = /^[A-Za-z0-9_-]+$/;
function isValidJwtFormat(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(".");
  if (parts.length !== 3) return false;
  return parts.every((part) => part.length > 0 && JWT_SEGMENT_REGEX.test(part));
}

// ─────────────────────────────────────────────────────────────
// Login page
// ─────────────────────────────────────────────────────────────
export function LoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setCurrentCDDBUser = useCurrentCDDBUserStore((s) => s.setCurrentUser);
  const userIdFromAuth = useAuthStore((s) => s.userId);
  const figmaData = useFigmaDataStore((s) => s.data);
  const userId = userIdFromAuth ?? figmaData?.user?.id ?? null;
  const figmaUserName = figmaData?.user?.name;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = token.trim();
    if (!value) { setError("Please enter a token."); return; }
    if (!isValidJwtFormat(value)) {
      setError("Please enter a valid JWT token (e.g. header.payload.signature).");
      return;
    }
    if (!userId) {
      setError(
        figmaData && !figmaData.user
          ? "Please log in to Figma to use this plugin."
          : "Please wait for the plugin to connect…"
      );
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (!figmaData?.figmaToken) {
        const stateCode = await getStateCode(userId, value);
        handleAllowFigmaPermission(stateCode.state);
        useFigmaDataStore.getState().setCddbToken(value as string);
      }
      const user = await getCurrentUser(value);
      if (!isAllowedEmail(user.email)) {
        setError("You are not authorized to use this plugin. Only designated users can access it.");
        setLoading(false);
        return;
      }
      setCurrentCDDBUser(user);
      persistCddbTokenToFigma(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid token. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <StarFieldBackdrop contentClassName="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-8">

        {/* branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="absolute -inset-2.5 rounded-2xl bg-foreground/5" />
            <div className="relative rounded-[10px] ring-1 ring-foreground/15">
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

        {/* form card — glass */}
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-xl border border-border bg-foreground/5 p-4 shadow-sm space-y-3 backdrop-blur-sm"
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
              onBlur={() => {
                const value = token.trim();
                if (value && !isValidJwtFormat(value)) {
                  setError("Please enter a valid JWT token.");
                }
              }}
              rows={4}
              autoFocus
              disabled={loading}
              aria-label="Access token"
              className={cn(
                "flex w-full rounded-lg border bg-foreground/5 px-3 py-2.5 text-[11px] font-mono leading-relaxed text-foreground shadow-inner resize-none",
                "placeholder:text-muted-foreground focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error ? "border-destructive" : "border-input"
              )}
            />
            {error && (
              <div className="flex items-start gap-1.5 pt-0.5">
                <AlertCircle className="mt-px h-3 w-3 shrink-0 text-red-400" />
                <p className="text-[11px] leading-snug text-red-400" role="alert">{error}</p>
              </div>
            )}
          </div>

          <Button type="submit" size="sm" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <>
                <MercedesStarSpinner className="h-3.5 w-3.5" />
                Verifying…
              </>
            ) : "Submit"}
          </Button>
        </form>

        {/* help */}
        <p className="text-center text-[11px] text-muted-foreground">
          Need a new token?{" "}
          <button
            type="button"
            onClick={getRefreshToken}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Reopen browser tab
          </button>
        </p>

    </StarFieldBackdrop>
  );
}
