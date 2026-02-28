
import {
  useFigmaDataStore,

} from "@/stores/figma-data-store";
import { usePluginStore } from "@/stores/plugin-store";

/**
 * Listens for Figma plugin messages (using event.data.pluginMessage when present),
 * handles typed messages (post-notification, importing-collections, parentCacheData,
 * font-style-updated, error), and stores init payload in Zustand + hydrates auth.
 */
export function useFigmaAuth() {
  const setFigmaData = useFigmaDataStore((s) => s.setFigmaData);
  // const setNotification = usePluginStore((s) => s.setNotification);
  const setMinimized = usePluginStore((s) => s.setMinimized);
  onmessage = async (event) => {
    const msg = event.data.pluginMessage;
    // console.log("handleMessage ", msg);
    if (!msg) return;
    switch (msg.type) {
      case "elementNotFound":
        // enqueueSnackbar(msg.message, { variant: "error" });
        break;
      case "elementonDifferentPage":
        // enqueueSnackbar(msg.message, { variant: "error" });
        break;
      case "elements-exist":
        // setTestedElements(msg.testedElements);
        break;

      case "newVersionCreated":
        // https://www.figma.com/design/jDUw4VzJmFjmgkAxsejHQe/screen-plugin-og?node-id=63-2&t=aOZCYEGBb6arG92B-1
        // no spaces in the file name!!!
        const name = msg.documentName.toLowerCase().replace(" ", "-");
        const url = encodeURI(
          `https://www.figma.com/design/${msg.documentKey}/${name}?version-id=${msg.versionId}`,
        );
        // onCreateRelease({ url, msg });
        break;
      default:
        if (msg.init) {
          console.log("msg->", msg);
          setFigmaData(msg);
        }

        break;
    }
  };
  
}
