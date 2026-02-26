import { useEffect, useState } from "react";
import { X, AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { NotificationVariant } from "@/stores/plugin-store";
import { usePluginStore } from "@/stores/plugin-store";
import { cn } from "@/lib/utils";

const AUTO_DISMISS_MS = 5_000;

const variantConfig: Record<
  NotificationVariant,
  { icon: typeof AlertCircle; borderClass: string; iconClass: string; barClass: string }
> = {
  error: {
    icon: AlertCircle,
    borderClass: "border-l-destructive",
    iconClass: "text-destructive",
    barClass: "bg-destructive",
  },
  warning: {
    icon: AlertTriangle,
    borderClass: "border-l-amber-500",
    iconClass: "text-amber-600 dark:text-amber-400",
    barClass: "bg-amber-500",
  },
  success: {
    icon: CheckCircle,
    borderClass: "border-l-emerald-500",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    barClass: "bg-emerald-500",
  },
  info: {
    icon: Info,
    borderClass: "border-l-primary",
    iconClass: "text-primary",
    barClass: "bg-primary",
  },
};

export function NotificationToast() {
  const notification = usePluginStore((s) => s.notification);
  const setNotification = usePluginStore((s) => s.setNotification);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!notification) return;
    setIsExiting(false);
    const t = setTimeout(() => {
      setIsExiting(true);
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [notification]);

  useEffect(() => {
    if (!isExiting) return;
    const t = setTimeout(() => {
      setNotification(null);
      setIsExiting(false);
    }, 220);
    return () => clearTimeout(t);
  }, [isExiting, setNotification]);

  const dismiss = () => {
    setIsExiting(true);
  };

  if (!notification) return null;

  const { icon: Icon, borderClass, iconClass, barClass } = variantConfig[notification.variant];

  return (
    <div
      role="alert"
      className={cn(
        "notification-toast fixed left-4 right-4 top-4 z-[200] flex flex-col overflow-hidden rounded-lg border border-border border-l-2 bg-card text-card-foreground shadow-xl sm:left-auto sm:right-4 sm:max-w-sm",
        borderClass,
        isExiting && "notification-toast-exit"
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon className={cn("mt-0.5 size-5 shrink-0", iconClass)} aria-hidden />
        <p className="min-w-0 flex-1 text-sm font-medium">{notification.message}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Dismiss notification"
        >
          <X className="size-4" />
        </button>
      </div>
      <div
        className="h-px w-full bg-muted"
        role="presentation"
        aria-hidden
      >
        <div
          className={cn("h-full", barClass)}
          style={{
            width: "100%",
            animation: `notification-progress-shrink ${AUTO_DISMISS_MS}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}
