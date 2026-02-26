function checkNodeForColorVariables(node: SceneNode): boolean {
  if (!node) return false;

  const propsToCheck: ("fills" | "strokes" | "effects")[] = [
    "fills",
    "strokes",
    "effects",
  ];

  try {
    for (const prop of propsToCheck) {
      if (!(prop in node)) continue;

      // @ts-expect-error: dynamically accessing known props
      const values = node[prop];
      if (!values || !Array.isArray(values)) continue;

      for (const paintOrEffect of values) {
        if (!paintOrEffect || !("boundVariables" in paintOrEffect)) continue;

        const boundVars = paintOrEffect.boundVariables;
        if (!boundVars) continue;

        for (const key in boundVars) {
          const variableRef = boundVars[key];
          if (variableRef && hasLinkedColor(variableRef)) {
            return true;
          }
        }
      }
    }

    if (node.type === "TEXT") {
      const textNode = node as TextNode;

      if (textNode.boundVariables) {
        if (
          textNode.boundVariables.fills &&
          hasLinkedColor(textNode.boundVariables.fills)
        ) {
          return true;
        }

        for (const key in textNode.boundVariables) {
          const variableRef = textNode.boundVariables[key];
          if (variableRef && hasLinkedColor(variableRef)) {
            return true;
          }
        }
      }

      if (
        textNode.getStyledTextSegments &&
        typeof textNode.getStyledTextSegments === "function"
      ) {
        try {
          const segments = textNode.getStyledTextSegments(["fills"]);

          for (const segment of segments) {
            if (segment.boundVariables && segment.boundVariables.fills) {
              if (hasLinkedColor(segment.boundVariables.fills)) {
                return true;
              }
            }
          }
        } catch (err) {
          console.log("Error checking text segments:", err);
        }
      }
    }
  } catch (err) {
    console.log(`Error checking node ${node.id}:`, err);
  }

  return false;
}

function hasLinkedColor(variable: unknown): boolean {
  try {
    return (
      variable !== null &&
      variable !== undefined &&
      typeof variable === "object" &&
      (variable as any).type === "VARIABLE_ALIAS"
    );
  } catch (err) {
    return false;
  }
}

export function getNodesUsingLinkedColorVariables(): {
  result: number;
  all: number;
} {
  console.log("Starting variable check on current page using findAll...");

  try {
    const allNodes = figma.currentPage.findAll();
    console.log(`Found ${allNodes.length} nodes on current page`);

    let nodesWithColorVars = 0;

    // Process nodes in batches to avoid UI freezing
    const batchSize = 500;
    for (let i = 0; i < allNodes.length; i += batchSize) {
      const batch = allNodes.slice(i, i + batchSize);

      for (const node of batch) {
        if (checkNodeForColorVariables(node)) {
          nodesWithColorVars++;
        }
      }

      // Log progress for large documents
      if (i % 5000 === 0 && i > 0) {
        console.log(`Processed ${i} of ${allNodes.length} nodes...`);
      }
    }

    console.log(
      `Completed: ${nodesWithColorVars}/${allNodes.length} nodes using linked color variables.`,
    );
    return { result: nodesWithColorVars, all: allNodes.length };
  } catch (error) {
    console.error("Error during variable check:", error);
    return { result: 0, all: 0 };
  }
}
