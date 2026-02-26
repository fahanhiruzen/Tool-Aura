import { SIZES_COLL_ID } from "./code";

type NodeWithChildren =
  | BooleanOperationNode
  | ComponentNode
  | ComponentSetNode
  | FrameNode
  | GroupNode
  | InstanceNode
  | PageNode
  | SectionNode;

export async function gridMessage(msg: any) {
  // console.log(msg)
  await figma.loadFontAsync({
    family: "Noto Sans Symbols2",
    style: "Regular",
  });
  const collection: VariableCollection | null =
    await getCollection(SIZES_COLL_ID);
  // console.log("collection ", collection);
  const selected = figma.currentPage.selection[0] as TextNode;
  // console.log("selected ", selected);
  const parent = getTopLevelParentWithPath(selected, []);
  // console.log("top level parent:  ", parent)
  const { fontSize, fontName, maxLines, fontWeight } = selected;
  if (!selected.textStyleId) {
    return figma.ui.postMessage({
      type: "error",
      message: `Please make sure the selected text node is connected to a font variable from the 'HU Component MBUX Library'
          and the 'HU component library' is imported to the figma file.`,
    });
  }
  if (!collection) {
    // console.log("ERROR: NO COLLECTION 'sizes' WITH ID: ", SIZES_COLL_ID);
    return figma.ui.postMessage({
      type: "error",
      message: `No collection 'sizes' found with ID: ${SIZES_COLL_ID}, please make sure you added the 'HU Component MBUX Library'
      to your figma file. Also make sure that the library is updated.`,
    });
  }
  // console.log("selected ", selected)
  const textStyleId: string =
    // @ts-ignore
    selected.textStyleId?.split(":")?.[1]?.split(",")?.[0] || "";
  const font = await figma.variables.getVariableByIdAsync(selected?.boundVariables?.fontFamily?.[0].id as string);
  // console.log("font ", font)
  if (selected.lineHeight.unit !== "PIXELS") {
    return figma.ui.postMessage({
      type: "error",
      message: `The LineHeight of the selected Textnode is set to ${selected.lineHeight?.unit}. Please select a font with a defined line height.`,
    });
  }

  const { worstCaseLines, worstCaseWidth } = getWidth(
    selected,
    collection!,
    parent,
  );


  // @ts-ignore
  let parentStyleId: string = parent.gridStyleId
    ?.split(":")?.[1]
    ?.split(",")?.[0];
  if (!parentStyleId) {
    // console.log(parentStyleId)
  }
  // console.log("textStyleId text-design ", selected);
  figma.ui.postMessage({
    type: "grid",
    worstCaseGrid: Math.round(worstCaseWidth).toString().replace(".", ","),
    gridWidth: Math.round(selected.width).toString().replace(".", ","),
    gridHeight: Math.round(selected.height).toString().replace(".", ","),
    fontSize,
    fontName,
    worstCaseNoLines: worstCaseLines,
    fontWeight,
    textStyleId,
    parentStyleId,
  });
}

export async function getCollection(id: string): Promise<any> {
  try {
    const importCollection =
      await figma.variables.getVariableCollectionByIdAsync(id);
    return importCollection;
  } catch (error) {
    console.log("getCollection Error fetching Figma data:", error);
    throw error;
  }
}

function getWidth(
  node: TextNode,
  screen_sizes: VariableCollection,
  parent: { node: NodeWithChildren; path: number[] },
): { worstCaseLines: number; worstCaseWidth: number } {
  const { widths, maxLines } = generateScreens(node, screen_sizes, parent);
  const worstCaseWidth = Math.min(...widths);
  const worstCaseLines = Math.max(...maxLines);
  return { worstCaseWidth, worstCaseLines };
}

function generateScreens(
  node: TextNode,
  screen_sizes: VariableCollection,
  parent: { node: NodeWithChildren; path: number[] },
): { widths: number[]; maxLines: number[] } {
  // let offsetX = parent.node.x + parent.node.width + 300;
  const textNodes: TextNode[] = [];
  const clones: NodeWithChildren[] = [];
  screen_sizes.modes.forEach((mode, i: number) => {
    const parentClone: any =
      parent.node.type === "COMPONENT"
        ? parent.node.createInstance()
        : parent.node.clone();
    parentClone.setExplicitVariableModeForCollection(screen_sizes, mode.modeId);

    const textNode = parent.path.reduce((acc: any, val: number) => {
      return acc?.children?.[val] || acc;
    }, parentClone);
    clones.push(parentClone);
    textNodes.push(textNode);
  });

  const widths: number[] = textNodes.map((text: TextNode) => {
    const isParentFlexible = text?.parent?.layoutMode !== "NONE";
    const isHug = text?.parent?.layoutSizingHorizontal === "HUG";
    return isParentFlexible && isHug
      ? (text?.maxWidth ?? text?.width)
      : text?.width;
  });

  const maxLines: number[] = textNodes.map((text: TextNode) => {
    return Math.round(text.height / (text.lineHeight?.value || text.height));
  });
  clones.forEach((c) => c.remove());
  return { widths, maxLines };
}

function getTopLevelParentWithPath(
  node: any,
  path: number[],
): { node: any; path: number[] } {
  if (node?.parent?.type === "PAGE") {
    return { node, path };
  }
  const childIndex = node?.parent?.children.findIndex(
    (x: any) => x.id === node.id,
  );
  return getTopLevelParentWithPath(node?.parent, [childIndex, ...path]);
}
