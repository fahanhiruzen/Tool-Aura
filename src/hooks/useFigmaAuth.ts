import { useEffect, useState } from "react";
import { getStateCode } from "@/api/auth";
import { getCurrentUser } from "@/api/user";
import { isAllowedEmail } from "@/config/allowed-users";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUserStore } from "@/stores/current-user-store";
import {
  useFigmaDataStore,
  type FigmaDataPayload,
} from "@/stores/figma-data-store";
import { usePluginStore } from "@/stores/plugin-store";

/** Same as previous app: Figma may send messages under event.data.pluginMessage */
function getPluginMessage(event: MessageEvent): unknown {
  const d = event.data;
  if (d && typeof d === "object" && "pluginMessage" in d) {
    return (d as { pluginMessage: unknown }).pluginMessage;
  }
  return d;
}

function isFigmaDataMessage(data: unknown): data is FigmaDataPayload {
  return (
    typeof data === "object" &&
    data !== null &&
    "user" in data &&
    ("pageId" in data || "fileId" in data)
  );
}

/**
 * Listens for Figma plugin messages (using event.data.pluginMessage when present),
 * handles typed messages (post-notification, importing-collections, parentCacheData,
 * font-style-updated, error), and stores init payload in Zustand + hydrates auth.
 */
export function useFigmaAuth() {
  const [initReceived, setInitReceived] = useState(false);
  const { setAuth, setValidated } = useAuthStore();
  const setFigmaData = useFigmaDataStore((s) => s.setFigmaData);
  const updateNodeFontStyle = useFigmaDataStore((s) => s.updateNodeFontStyle);
  const setInitLoading = usePluginStore((s) => s.setInitLoading);
  const setNotification = usePluginStore((s) => s.setNotification);
  const setParentCacheData = usePluginStore((s) => s.setParentCacheData);
  const setMinimized = usePluginStore((s) => s.setMinimized);
  const setAllowedToUsePlugin = usePluginStore((s) => s.setAllowedToUsePlugin);
  const setCurrentUser = useCurrentUserStore((s) => s.setCurrentUser);
  const setUserRoles = useCurrentUserStore((s) => s.setUserRoles);

  useEffect(() => {
    function requestInit() {
      try {
        const parent = window.parent;
        if (parent && parent !== window) {
          parent.postMessage({ pluginMessage: { type: "requestInit" } }, "*");
        }
      } catch {
        setInitReceived(true);
      }
    }

    function onMessage(event: MessageEvent) {
      const msg = getPluginMessage(event);
      if (msg == null || typeof msg !== "object") return;

      const m = msg as Record<string, unknown>;
      const type = m.type as string | undefined;

      if (type === "post-notification") {
        setNotification({
          message: (m.message as string) ?? "Notification",
          variant: "error",
        });
        return;
      }

      if (type === "importing-collections") {
        setInitLoading({
          loading: (m.value as boolean) ?? false,
          message: (m.message as string) ?? null,
        });
        return;
      }

      if (type === "parentCacheData") {
        const data = (m.data as string) ?? null;
        setParentCacheData(data);
        return;
      }

      if (type === "font-style-updated") {
        const nodeId = m.nodeId as string | undefined;
        const fontStyle = (m.fontStyle as string | null) ?? null;
        if (nodeId) updateNodeFontStyle(nodeId, fontStyle);
        return;
      }

      if (type === "resized") {
        setMinimized((m.minimized as boolean) ?? false);
        return;
      }

      if (type === "error") {
        setNotification({
          message: (m.message as string) ?? "An error occurred",
          variant: "error",
        });
        return;
      }

      // Init / data payload (getFigmaData): has user, pageId or fileId
      if (!isFigmaDataMessage(m)) return;

      setInitReceived(true);
      const payload = m as FigmaDataPayload;
      if (payload.init) {
        setInitLoading({ loading: false, message: null });
      }
      setFigmaData(payload);

      const uid = payload.user?.id ?? null;
      const storedToken =
        typeof payload.cddbToken === "string" && payload.cddbToken
          ? payload.cddbToken
          : typeof payload.accessToken === "string" && payload.accessToken
            ? payload.accessToken
            : null;

      // If we're already validated with the same token/user (e.g. after maximize), keep validated
      const { token: currentToken, userId: currentUserId, isValidated } = useAuthStore.getState();
      const alreadyValidated =
        isValidated &&
        currentToken === storedToken &&
        currentUserId === uid;

      setAuth(storedToken, uid, alreadyValidated);

      if (storedToken && uid) {
        if (alreadyValidated) {
          // Just refresh user/roles; don't re-run validation or we'd briefly show Token modal
          getCurrentUser(storedToken)
            .then((response) => {
              setUserRoles(response.roles.map((x) => x.name));
              setCurrentUser(response);
              setAllowedToUsePlugin(isAllowedEmail(response.email));
            })
            .catch(() => {});
        } else {
          getStateCode(uid, storedToken)
            .then(() =>
              getCurrentUser(storedToken).then(
                (response) => {
                  const allowed = isAllowedEmail(response.email);
                  setCurrentUser(response);
                  setUserRoles(response.roles.map((x) => x.name));
                  setAllowedToUsePlugin(allowed);
                  setValidated(allowed);
                  if (!allowed) {
                    setNotification({
                      message: "You are not authorized to use this plugin. Only designated users can access it.",
                      variant: "error",
                    });
                  }
                },
                (err) => {
                  setNotification({
                    message: err instanceof Error ? err.message : "Failed to load user",
                    variant: "error",
                  });
                  setValidated(false);
                }
              )
            )
            .catch(() => setValidated(false));
        }
      } else {
        setValidated(false);
      }
    }

    window.addEventListener("message", onMessage);
    requestInit();
    return () => window.removeEventListener("message", onMessage);
  }, [
    setAuth,
    setValidated,
    setFigmaData,
    updateNodeFontStyle,
    setInitLoading,
    setNotification,
    setParentCacheData,
    setMinimized,
    setAllowedToUsePlugin,
    setCurrentUser,
    setUserRoles,
  ]);

  const userId = useAuthStore((s) => s.userId);
  const token = useAuthStore((s) => s.token);
  return { initReceived, userId, token };
}
