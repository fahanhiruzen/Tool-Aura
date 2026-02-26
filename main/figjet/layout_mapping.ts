export async function generateLayoutWrapper(node: FrameNode): Promise<string> {
  if (node) {
    const layoutProperties = node;
    // console.error(node.name + ":" + JSON.stringify(layoutProperties));
    if (layoutProperties) {
      if (layoutProperties.layoutMode === "HORIZONTAL") {
        return `Row(
  modifier = Modifier${await generateModifiers(node)},
  horizontalArrangement = ${generateArrangement(layoutProperties)},
  verticalAlignment = ${generateAlignment(layoutProperties.counterAxisAlignItems, true)}
){`;
      } else if (layoutProperties.layoutMode === "VERTICAL") {
        return `Column(
  modifier = Modifier${await generateModifiers(node)},
  verticalArrangement = ${generateArrangement(layoutProperties)},
  horizontalAlignment = ${generateAlignment(layoutProperties.counterAxisAlignItems, false)}
){`;
      } else if (layoutProperties.layoutMode === "NONE") {
        return `Box(
  modifier = Modifier${await generateModifiers(node)},
){`;
      }
    } else {
      return `Box(
  modifier = Modifier${await generateModifiers(node)},
){`;
    }
  }
  return "";
}

function mapAlignment(alignment: string, vertical: boolean): string {
  switch (alignment) {
    case "MIN":
      return vertical ? "Top" : "Start";
    case "CENTER":
      return vertical ? "CenterVertically" : "CenterHorizontally";
    case "MAX":
      return vertical ? "Bottom" : "End";
    case "STRETCH":
      return "Center";
    default:
      return "UnknownAlignment";
  }
}

function generateAlignment(alignment: any, vertical: boolean): string {
  return `Alignment.${mapAlignment(alignment, vertical)}`;
}

function generateArrangement(layout: InferredAutoLayoutResult): string {
  if (layout.primaryAxisAlignItems === "SPACE_BETWEEN") {
    return `Arrangement.SpaceBetween`;
  } else {
    return `Arrangement.spacedBy(${layout.itemSpacing}.dp, ${generateAlignment(layout.primaryAxisAlignItems, layout.layoutMode === "VERTICAL")})`;
  }
}

export async function generateModifiers(node: (FrameNode | InstanceNode)): Promise<string> {
  let modifiers = "";

  const layoutProperties = node;

  // TODO: Respect aboslute positioning in autolayout frame "layoutPositioning: 'AUTO' | 'ABSOLUTE'"

  if (layoutProperties.layoutMode !== "NONE") {
    const fixedWidth = layoutProperties.layoutSizingHorizontal === "FIXED"
    const fixedHeight = layoutProperties.layoutSizingVertical === "FIXED"
    if (fixedWidth && node.constraints.horizontal !== "SCALE" && node.constraints.horizontal !== "STRETCH") {
      modifiers += `\n.width(${node.width}.dp)`;
    }
    if (fixedHeight && node.constraints.vertical !== "SCALE" && node.constraints.vertical !== "STRETCH") {
      modifiers += `\n.height(${node.height}.dp)`;
    }
    if (layoutProperties.layoutSizingHorizontal === "HUG" && node.children) {
      for (const child of node.children) {
        if ("layoutSizingHorizontal" in child && child.layoutSizingHorizontal === "FILL") {
          modifiers += `\n.width(IntrinsicSize.Min)`;
          break;
        }
      }
    }
    if (layoutProperties.layoutSizingVertical === "HUG" && node.children) {
      for (const child of node.children) {
        if ("layoutSizingVertical" in child && child.layoutSizingVertical === "FILL") {
          modifiers += `\n.height(IntrinsicSize.Min)`;
          break;
        }
      }
    }
    if (layoutProperties.paddingLeft || layoutProperties.paddingRight || layoutProperties.paddingTop || layoutProperties.paddingBottom) {
      // TODO: Remove hack due to "bug" in the way the button is built up in Figma
      if (node.type === "INSTANCE") {
        const mainComponent = await (node as InstanceNode).getMainComponentAsync();
        if (mainComponent?.parent?.name !== "button") {
          modifiers += `\n.padding(start = ${layoutProperties.paddingLeft}.dp, end = ${layoutProperties.paddingRight}.dp, top = ${layoutProperties.paddingTop}.dp, bottom = ${layoutProperties.paddingBottom}.dp)`;
        }
      } else {
        modifiers += `\n.padding(start = ${layoutProperties.paddingLeft}.dp, end = ${layoutProperties.paddingRight}.dp, top = ${layoutProperties.paddingTop}.dp, bottom = ${layoutProperties.paddingBottom}.dp)`;
      }
    }
  } else {
    if (node.width && node.constraints.horizontal !== "SCALE" && node.constraints.horizontal !== "STRETCH") {
      modifiers += `\n.width(${node.width}.dp)`;
    }

    if (node.height && node.constraints.vertical !== "SCALE" && node.constraints.vertical !== "STRETCH") {
      modifiers += `\n.height(${node.height}.dp)`;
    }
  }

  if (node.layoutSizingHorizontal === "FILL") {
    modifiers += `\n.fillMaxWidth()`;
  }
  if (node.layoutSizingVertical === "FILL") {
    modifiers += `\n.fillMaxHeight()`;
  }

  let xOffset = 0;
  let yOffset = 0;
  let horizontalAlignment = '';
  let verticalAlignment = '';

  if (node.parent && node.parent.type === "FRAME" && node.parent.layoutMode === "NONE") {
    const parentNode = node.parent as FrameNode;

    switch (node.constraints.horizontal) {
      case "MIN":
        horizontalAlignment = 'Start';
        xOffset = node.x;
        break;
      case "CENTER":
      case "SCALE":
        horizontalAlignment = 'Center';
        xOffset = -parentNode.width / 2 + node.width / 2 + node.x;
        break;
      case "MAX":
        horizontalAlignment = 'End';
        xOffset = -parentNode.width + node.width + node.x;
        break;
      case "STRETCH":
        horizontalAlignment = 'Start';
        break;
    }

    switch (node.constraints.vertical) {
      case "MIN":
        verticalAlignment = 'Top';
        yOffset = node.y;
        break;
      case "CENTER":
      case "SCALE":
        verticalAlignment = 'Center';
        yOffset = -parentNode.height / 2 + node.height / 2 + node.y;
        break;
      case "MAX":
        verticalAlignment = 'Bottom';
        yOffset = -parentNode.height + node.height + node.y;
        break;
      case "STRETCH":
        verticalAlignment = 'Top';
        break;
    }

    if (verticalAlignment === 'Center' && horizontalAlignment === 'Center') {
      verticalAlignment = ""
    }

    if (verticalAlignment || horizontalAlignment) {
      modifiers += `\n.align(Alignment.${verticalAlignment}${horizontalAlignment})`;
    }
    if (xOffset || yOffset) {
      modifiers += `\n.offset(x = ${xOffset}.dp, y = ${yOffset}.dp)`;
    }

    if (node.constraints.horizontal === "STRETCH") {
      const start = node.x;
      const end = parentNode.width - node.x - node.width;
      if (start || end) {
        modifiers += `\n.padding(start = ${start}.dp, end = ${end}.dp)`;
      }
      modifiers += `\n.fillMaxWidth()`;
    }
    if (node.constraints.vertical === "STRETCH") {
      const top = node.y;
      const bottom = parentNode.height - node.y - node.height;
      if (top || bottom) {
        modifiers += `\n.padding(top = ${top}.dp, bottom = ${bottom}.dp)`;
      }
      modifiers += `\n.fillMaxHeight()`;
    }
    if (node.constraints.vertical === "SCALE") {
      console.error("Scale not supported!")
    }
    if (node.constraints.horizontal === "SCALE") {
      console.error("Scale not supported!")
    }
  }

  return modifiers;
}

/*
{"layoutMode":"HORIZONTAL",
"paddingLeft":0,
"paddingRight":36,
"paddingTop":0,
"paddingBottom":0,
"counterAxisSizingMode":"FIXED",
"primaryAxisSizingMode":"AUTO",
"primaryAxisAlignItems":"MIN",
"counterAxisAlignItems":"MIN",
"layoutAlign":"MIN",
"layoutGrow":0,
"itemSpacing":38,
"layoutPositioning":"AUTO"}
*/