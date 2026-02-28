import { messageHandler } from "./messageHandler";

const showUi = () => {
  figma.showUI(__html__, { themeColors: true, height: 600, width: 712 });
};

figma.ui.onmessage = (msg) => {
  messageHandler(msg);
};

const getLocalStorageData = async (key: string) => {
  try {
    const retrievedData = await figma.clientStorage.getAsync(key);
    if (retrievedData) {
      return retrievedData;
    }
    return null;
  } catch (error) {
    console.log(`Data with key "${key}" not found in client storage.`);
    return null;
  }
};
const extractNames = (obj: any) => {
  const result: string[] = [];

  const traverse = (node: any) => {
    if (node && typeof node === "object" && node.name) {
      result.push(node.name);
      traverse(node.parent);
    }
  };

  traverse(obj);
  return result.slice(1, -2);
};
const getFigmaData = async (init: boolean) => {
  return {
    fileName: figma.root.name,
    mode: figma.editorType, //for react to understand if plugin is opened in dev mode or design mode.
    user: figma.currentUser, //data of user, currently not using in react.
    figmaToken: await getLocalStorageData(`figma_access_token`), //this is fetching cached figma access token for necesary for making figma api calls.
    cddbToken: await getLocalStorageData(`cddb_access_token`), // for fetching the cached cddb token
    fileId: figma.fileKey, // the is document key where all the figma element lies.
    init, // for react to undertand the porps if plugin is first time opened or already opened and data changed to it fetched file data and branches
  };
};

figma.on("run", async () => {
  showUi();
  figma.ui.postMessage(await getFigmaData(true));
});

figma.on("selectionchange", async () => {
  figma.ui.postMessage(await getFigmaData(false));
});
