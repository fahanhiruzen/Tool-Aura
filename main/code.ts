import { generateCodeForNode } from "./figjet/code";
import { getFigmaInstance } from "./figjet/metadata.service";
import { getCollection, gridMessage } from "./text-design";
import { getNodesUsingLinkedColorVariables } from "./variableCheck";
import { WIDGET_CLASSES } from "./widget-classes";

/** Injected at build time by build-plugin.mjs with the UI HTML (e.g. dist/index.html). */
declare const __html__: string;

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const NODE_CACHE_MAX = 10_000;
const UI_HEIGHT = 600;
const UI_WIDTH = 711;

export let SIZES_COLL_ID =
  "VariableCollectionId:e42937af1d16769449ba78edbb8f49f3586a35e0/7366:525";

// -----------------------------------------------------------------------------
// Node cache
// -----------------------------------------------------------------------------

const nodeCache = new Map<string, BaseNode | null>();

async function getNodeByIdCached(id: string): Promise<BaseNode | null> {
  const cached = nodeCache.get(id);
  if (cached !== undefined) return cached;
  const node = await figma.getNodeByIdAsync(id);
  if (nodeCache.size >= NODE_CACHE_MAX) {
    const firstKey = nodeCache.keys().next().value;
    if (firstKey !== undefined) nodeCache.delete(firstKey);
  }
  nodeCache.set(id, node);
  return node;
}

// -----------------------------------------------------------------------------
// Helpers: tree / node utils
// -----------------------------------------------------------------------------

function extractIdAndName(obj: any): { id: string; name: string; node: any }[] {
  const result: { id: string; name: string; node: any }[] = [];
  const traverse = (node: any) => {
    if (node && typeof node === "object" && node.name) {
      result.push({ id: node.id, name: node.name, node });
      traverse(node.parent);
    }
  };
  traverse(obj);
  return result;
}

function extractNames(obj: any, slice = true): string[] {
  const result: string[] = [];
  const traverse = (node: any) => {
    if (node && typeof node === "object" && node.name) {
      result.push(node.name);
      traverse(node.parent);
    }
  };
  traverse(obj);
  return slice ? result.slice(1, -2) : result;
}

function pageContainsNode(page: PageNode, targetId: string): boolean {
  function searchNode(node: BaseNode): boolean {
    if (node.id === targetId) return true;
    if ("children" in node) {
      for (const child of node.children) {
        if (searchNode(child)) return true;
      }
    }
    return false;
  }
  return searchNode(page);
}

// -----------------------------------------------------------------------------
// Helpers: storage
// -----------------------------------------------------------------------------

async function getLocalStorageData(key: string): Promise<string> {
  try {
    const data = await figma.clientStorage.getAsync(key);
    return data ?? "{}";
  } catch {
    return "{}";
  }
}

// -----------------------------------------------------------------------------
// Helpers: variable collections
// -----------------------------------------------------------------------------

async function collectionExists(
  collectionId: string
): Promise<VariableCollection | null> {
  try {
    return await figma.variables.getVariableCollectionByIdAsync(collectionId);
  } catch {
    figma.ui.postMessage({
      type: "importing-collections",
      value: true,
      message: "Figma variable collections library import in progress...",
    });
    return null;
  }
}

async function importCollections(): Promise<{
  collections: any[];
  sizes_coll_id: string | null;
}> {
  let sizes_coll_id: string | null = null;
  const variableCollections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const resolved = await Promise.all(
    variableCollections?.map(async (collection: any) => {
      const collectionVariables =
        await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
          collection.key
        );
      const fullValueVariables: any[] = await Promise.all(
        collectionVariables.map(async (v) => {
          const importedVar = await figma.variables.importVariableByKeyAsync(
            v.key
          );
          return {
            id: v.key,
            variableCollectionId: importedVar.variableCollectionId,
            name: importedVar.name,
            type: importedVar.resolvedType,
            valuesByMode: importedVar.valuesByMode,
          };
        })
      );
      if (
        collection.name === "sizes" &&
        collection.libraryName === "HU Component MBUX Library"
      ) {
        sizes_coll_id = fullValueVariables[0]?.variableCollectionId ?? null;
        SIZES_COLL_ID = fullValueVariables[0]?.variableCollectionId ?? SIZES_COLL_ID;
      }
      const importCollection =
        await figma.variables.getVariableCollectionByIdAsync(
          fullValueVariables[0]?.variableCollectionId
        );
      return {
        collectionId: importCollection?.id,
        collectionName: collection.name,
        modes: importCollection?.modes,
        key: collection.key,
        variables: fullValueVariables,
      };
    }) ?? []
  );
  return { collections: resolved, sizes_coll_id };
}

// -----------------------------------------------------------------------------
// Figma data payload for UI
// -----------------------------------------------------------------------------

async function getFigmaData(
  init: boolean,
  selectedLayerIds: string[]
): Promise<any> {
  let collection: VariableCollection | null = null;
  await collectionExists(SIZES_COLL_ID);

  if (init && figma.mode === "default" && !collection) {
    figma.ui.postMessage({
      type: "importing-collections",
      value: true,
      message: "Figma variable collections library import in progress...",
    });
    const { sizes_coll_id } = await importCollections();
    collection = await getCollection(sizes_coll_id || SIZES_COLL_ID);
    figma.ui.postMessage({
      type: "importing-collections",
      value: false,
      message: null,
    });
  }

  const nodes = await Promise.all(
    selectedLayerIds.map(async (layerId) => {
      const node = await getNodeByIdCached(layerId);
      let fontStyle: string | null = null;
      if (!node) return null;

      let type = node.type;
      let temp: string = "CUSTOM";
      const mainComponent =
        "mainComponent" in node ? await node.getMainComponentAsync() : null;

      if (mainComponent) {
        const key: any =
          mainComponent?.parent?.key ?? (mainComponent as any)?.key;
        temp = key && key in WIDGET_CLASSES ? WIDGET_CLASSES[key] : "CUSTOM";
      } else if (
        type !== "TEXT" &&
        node.name.toLowerCase().includes("icon")
      ) {
        temp = "Icon";
      }

      const isTextComponent = temp?.toLowerCase() === "text";
      const workingNode = (isTextComponent ? node.children[0] : node) as SceneNode;
      type = isTextComponent ? "TEXT" : type;
      const name =
        type === "TEXT" && "characters" in workingNode
          ? workingNode.characters
          : temp;

      if (
        type === "TEXT" &&
        figma.mode === "default" &&
        workingNode.textStyleId
      ) {
        const localTextStyles = await figma.getStyleByIdAsync(
          workingNode.textStyleId
        );
        fontStyle = localTextStyles?.name ?? null;
      }

      let maxLines: number | null = null;
      if (type === "TEXT" && figma.mode === "default" && "lineHeight" in workingNode) {
        await Promise.all(
          workingNode
            .getRangeAllFontNames(0, workingNode.characters.length)
            .map(figma.loadFontAsync)
        );
        const tmpNode = workingNode.clone();
        tmpNode.textAutoResize = "WIDTH_AND_HEIGHT";
        figma.currentPage.appendChild(tmpNode);
        tmpNode.characters = "placeholder";
        const lh = (workingNode as any).lineHeight;
        maxLines = Math.floor(workingNode.height / (lh?.value ?? workingNode.height));
        tmpNode.remove();
      }

      return {
        id: layerId,
        name,
        parentId: node.parent?.id ?? null,
        type: type
          ? String(type).charAt(0).toUpperCase() + String(type).slice(1).toLowerCase()
          : "",
        parentNames: extractNames(node),
        width: Math.round(workingNode.width),
        height: Math.round(workingNode.height),
        fontStyle,
        worstCaseNoLines: maxLines,
      };
    })
  );

  return {
    pageId: figma.currentPage.id,
    nodeId:
      figma.currentPage.selection.length > 0
        ? figma.currentPage.selection[0].id
        : null,
    sizes: {
      id: SIZES_COLL_ID,
      modes: collection?.modes ?? [],
      name: collection?.name ?? "",
      variableIds: collection?.variableIds ?? [],
    },
    nodes,
    mode: figma.editorType,
    user: figma.currentUser,
    accessToken: await getLocalStorageData("figma_access_token"),
    cddbToken: await getLocalStorageData("cddb_access_token"),
    elementData: await getLocalStorageData(
      `document_identifier_${figma.fileKey}`
    ),
    fileId: figma.fileKey,
    init,
  };
}

// -----------------------------------------------------------------------------
// UI message handlers
// -----------------------------------------------------------------------------

async function handleGetParentCache(msg: { data: { parentKey: string } }) {
  try {
    const data = await figma.clientStorage.getAsync(msg.data.parentKey);
    figma.ui.postMessage({ type: "parentCacheData", data: data ?? "{}" });
  } catch (error) {
    console.error("❌ CACHE GET - Error:", error);
    figma.ui.postMessage({ type: "parentCacheData", data: "{}" });
  }
}

async function handleHighlightElements(msg: { data: { value: string[] } }) {
  const ids = msg.data.value;
  const nodes = await Promise.all(ids.map((id) => getNodeByIdCached(id)));
  const validNodes = nodes.filter((n): n is SceneNode => n != null);
  if (validNodes.length > 0) {
    figma.currentPage.selection = figma.currentPage.selection.concat(validNodes);
  }
}

async function handleFindElement(msg: { data: { value: string } }) {
  const id = msg.data.value;
  if (!id) return;

  const node = await getNodeByIdCached(id);
  if (!node) {
    figma.ui.postMessage({
      type: "post-notification",
      value: true,
      message:
        "Element associated with this unique id is not found in the current file.",
    });
    return;
  }

  try {
    figma.currentPage.selection = figma.currentPage.selection.concat([
      node as SceneNode,
    ]);
  } catch {
    const tree = extractIdAndName(node);
    const pageNode = tree[tree.length - 2]?.node;
    if (pageNode?.type === "PAGE") {
      await figma.setCurrentPageAsync(pageNode);
      figma.currentPage.selection = figma.currentPage.selection.concat([
        node as SceneNode,
      ]);
    } else {
      await figma.loadAllPagesAsync();
      for (const page of figma.root.children) {
        if (pageContainsNode(page as PageNode, node.id)) {
          await figma.setCurrentPageAsync(page as PageNode);
          figma.currentPage.selection = figma.currentPage.selection.concat([
            node as SceneNode,
          ]);
          break;
        }
      }
    }
  }
}

async function handleChangeLayerName(msg: {
  data: {
    figmaElementId?: string;
    safeModeRelevant?: string;
    hasData?: boolean;
    trinfoId?: string;
  };
}) {
  const { data } = msg;
  const node =
    data.figmaElementId != null
      ? await getNodeByIdCached(data.figmaElementId)
      : (figma.currentPage.selection[0] ?? null);
  if (!node) return;

  let baseName = node.name
    .replace(/^[\u2139\uFE0F️ℹ]+\s*/, "")
    .replace(/^🟥\s*/, "")
    .replace(/^💬\s*/, "")
    .trim();
  if (baseName.startsWith("ℹ") || baseName.startsWith("\u2139")) {
    baseName = baseName.replace(/^[^\w\s]*\s*/, "").trim();
  }

  let newName = baseName;
  if (data.safeModeRelevant === "YES") newName = "🟥 " + newName;
  if (data.hasData) newName = "ℹ️ " + newName;
  if (data.trinfoId) newName = "💬 " + newName;
  node.name = newName;
}

async function handleSetStorage(msg: { data: { key: string; value: any } }) {
  if (msg.data?.key == null) return;
  try {
    await figma.clientStorage.setAsync(msg.data.key, msg.data.value);
    console.log("✅ CACHE SET - Data successfully stored");
  } catch (err) {
    console.error("❌ CACHE SET - Storage error:", err);
  }
}

figma.ui.onmessage = async (msg: any) => {
  switch (msg.type) {
    case "getParentCache":
      await handleGetParentCache(msg);
      return;
    case "variable-check":
      getNodesUsingLinkedColorVariables();
      return;
    case "grid":
      await gridMessage(msg);
      return;
    case "highlightElements":
      await handleHighlightElements(msg);
      return;
    case "findElement":
      await handleFindElement(msg);
      return;
    case "changeLayerName":
      await handleChangeLayerName(msg);
      return;
    default:
      if (msg.data?.key != null) {
        await handleSetStorage(msg);
      }
      break;
  }
};

// -----------------------------------------------------------------------------
// Codegen (FigJet) init
// -----------------------------------------------------------------------------

async function figJetPluginInitiator() {
  figma.codegen.on("generate", async (event) => {
    let uniqueId = "";
    try {
      const token = await getLocalStorageData("cddb_access_token");
      const id =
        figma.currentPage.selection.length > 0
          ? figma.currentPage.selection[0].id
          : null;
      const doc = figma.fileKey;
      const metaData = await getFigmaInstance(doc ?? "", id ?? "", token);
      uniqueId = `${metaData.uniqueId}`;
    } catch (e: any) {
      if (e?.message?.includes("401")) {
        uniqueId =
          "You are not currently logged in to CDDB.\nPlease switch to another mode and log in using the plugin.\nThen try again. Thank you!";
      } else {
        uniqueId = "Id does not exist for this element!";
      }
    }

    const { widgetCode, customComponents } = await generateCodeForNode(
      event.node,
      0
    );
    const alreadyAdded: string[] = [];
    const dedupedComponents = customComponents.filter((c) => {
      if (alreadyAdded.includes(c.title)) return false;
      alreadyAdded.push(c.title);
      return true;
    });

    const codeBlocks: CodegenResult[] = [
      {
        title: `${event.node.name} Unique Id`,
        code: uniqueId,
        language: "JAVASCRIPT",
      },
      {
        language: "KOTLIN",
        code: widgetCode,
        title: event.node.name,
      },
      ...dedupedComponents,
    ];

    return codeBlocks;
  });
}

// -----------------------------------------------------------------------------
// Plugin lifecycle
// -----------------------------------------------------------------------------

function showUi() {
  figma.showUI(__html__, {
    themeColors: false,
    height: UI_HEIGHT,
    width: UI_WIDTH,
  });
}

figma.on("run", async () => {
  await figma.loadAllPagesAsync();

  figma.on("documentchange", async (event: any) => {
    for (const change of event.documentChanges) {
      if (
        change.type === "PROPERTY_CHANGE" &&
        change.origin === "LOCAL" &&
        change.properties?.includes("textStyleId")
      ) {
        const changedNode = change.node;
        const isSelected = figma.currentPage.selection.some(
          (s) => s.id === changedNode.id
        );
        if (isSelected && changedNode.textStyleId) {
          const localTextStyles = await figma.getStyleByIdAsync(
            changedNode.textStyleId
          );
          figma.ui.postMessage({
            type: "font-style-updated",
            nodeId: changedNode.id,
            fontStyle: localTextStyles?.name,
            message:
              "Font style updated, please commit your data now to keep in sync with CDDB!",
          });
        }
      }
    }
  });

  if (figma.mode === "codegen") {
    await figJetPluginInitiator();
  } else {
    showUi();
    const selectedLayerIds = figma.currentPage.selection.map((layer) => layer.id);
    figma.ui.postMessage(await getFigmaData(true, selectedLayerIds));
  }
});

figma.on("selectionchange", async () => {
  if (figma.mode === "codegen") {
    await figJetPluginInitiator();
  } else {
    const lock = await figma.clientStorage.getAsync("lock");
    if (!lock) {
      const selectedLayerIds = figma.currentPage.selection.map((l) => l.id);
      figma.ui.postMessage(await getFigmaData(false, selectedLayerIds));
    }
  }
});
