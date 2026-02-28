import { PluginLogo } from "./PluginLogo";
import { StarFieldBackdrop } from "./StarFieldBackdrop";

export function LoadingScreen() {
  return (
    <StarFieldBackdrop contentClassName="flex flex-col items-center justify-center gap-3">
      <div className="rounded-[10px] ring-1 ring-black/8 dark:ring-white/15">
        <PluginLogo />
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </StarFieldBackdrop>
  );
}
