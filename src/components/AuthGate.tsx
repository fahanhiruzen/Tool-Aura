import { useFigmaAuth } from "@/hooks/useFigmaAuth";
import { LoginPage } from "@/components/LoginPage";
import { signOut, useCurrentCDDBUserStore, useFigmaDataStore, usePluginStore } from "@/stores";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { FigmaTokenWaitScreen } from "@/components/auth/FigmaTokenWaitScreen";
import { getCurrentUser, removeFigmaToken, validateFigmaToken } from "@/api/user";
import { useEffect } from "react";
import { getStateCode, handleAllowFigmaPermission } from "@/api/auth";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  useFigmaAuth();
  const data = useFigmaDataStore((x) => x.data);
  const setCurrentUser = useCurrentCDDBUserStore((x) => x.setCurrentUser);
  const setFigmaAccessToken = useFigmaDataStore((x) => x.setFigmaAccessToken);
  const figmaAccessToken = data?.figmaToken;
  const cddbToken = data?.cddbToken;

  useEffect(() => {
    if(cddbToken){
      getCurrentUser(cddbToken).then((user) => {
        setCurrentUser(user);
      }).catch((err) => {
        signOut();
        usePluginStore.getState().setNotification({
          message: err.message,
          variant: "error",
        });
      });
      
    }
    if(figmaAccessToken){
      validateFigmaToken(figmaAccessToken).then((_) => {
      }).catch(async (err) => {
        setFigmaAccessToken(null);
        try{
          await removeFigmaToken(data?.user?.id??"");
        } catch(err){}
        signOut();
        usePluginStore.getState().setNotification({
          message: err.message,
          variant: "error",
        });
        setFigmaAccessToken(null);
      });
    }
    if(cddbToken && !figmaAccessToken){
      getStateCode(data?.user?.id??"", cddbToken).then((res) => {
        handleAllowFigmaPermission(res.state);
      }).catch((err) => {
        usePluginStore.getState().setNotification({
          message: err.message,
          variant: "error",
        });
      });
    }
  }, [data]);

  if (data === null) {
    return (
      <main style={{ height: "100vh" }}>
        <LoadingScreen />
      </main>
    );
  }

  if (!cddbToken) {
    return (
      <main>
        <LoginPage />
      </main>
    );
  }

  if (!figmaAccessToken) {
    return (
      <main style={{ height: "100vh" }}>
        <FigmaTokenWaitScreen />
      </main>
    );
  }

  return <main>{children}</main>;
}
