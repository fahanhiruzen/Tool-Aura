import React from "react";
import { usePluginSetup } from "@/hooks/use-plugin-setup";

export function PluginSetup({ children }: { children: React.ReactNode }) {
  const _ = usePluginSetup();

  return <>{children}</>;
}
