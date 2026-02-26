import { useState } from "react";
import { X, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStateCode, getRefreshToken } from "@/api/auth";
import { getCurrentUser } from "@/api/user";
import { isAllowedEmail } from "@/config/allowed-users";
import { useAuthStore, persistTokenToFigma } from "@/stores/auth-store";
import { useCurrentUserStore } from "@/stores/current-user-store";
import { useFigmaDataStore } from "@/stores/figma-data-store";
import { usePluginStore } from "@/stores/plugin-store";
import { cn } from "@/lib/utils";

interface TokenModalProps {
  onClose?: () => void;
}

export function TokenModal({ onClose }: TokenModalProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { setToken: setStoreToken, setValidated } = useAuthStore();
  const setCurrentUser = useCurrentUserStore((s) => s.setCurrentUser);
  const setUserRoles = useCurrentUserStore((s) => s.setUserRoles);
  const setAllowedToUsePlugin = usePluginStore((s) => s.setAllowedToUsePlugin);
  const setNotification = usePluginStore((s) => s.setNotification);
  const userIdFromAuth = useAuthStore((s) => s.userId);
  const figmaData = useFigmaDataStore((s) => s.data);
  const userId = userIdFromAuth ?? figmaData?.user?.id ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = token.trim();
    if (!value) {
      setError("Please enter a token.");
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
      await getStateCode(userId, value);
      const user = await getCurrentUser(value);
      if (!isAllowedEmail(user.email)) {
        setError(
          "You are not authorized to use this plugin. Only designated users can access it."
        );
        setLoading(false);
        return;
      }
      setStoreToken(value);
      setValidated(true);
      persistTokenToFigma(value);
      setUserRoles(user.roles.map((x) => x.name));
      setCurrentUser(user);
      setAllowedToUsePlugin(true);
      setNotification({
        message: "Signed in successfully.",
        variant: "success",
      });
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid token. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-screen w-full items-center justify-center bg-background"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-[560px] max-w-[95vw] rounded-2xl border border-border bg-card px-6 pb-0 pt-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shadow-sm">
            <KeyRound className="h-5 w-5 text-foreground" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-foreground">
          Enter your token
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your JWT access token below. It will be used to authorize API
          calls and stored securely in the plugin.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <textarea
              placeholder="Paste your JWT token here..."
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError(null);
              }}
              rows={5}
              autoFocus
              disabled={loading}
              aria-label="Access token"
              className={cn(
                "flex min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm transition-colors",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              )}
            />
            {error && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={getRefreshToken}
              disabled={loading}
            >
              Reopen
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Checking…" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
