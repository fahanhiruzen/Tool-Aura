export async function messageHandler(msg: any) {
  switch (msg.type) {
    case "jumpToElement": {
      const elementIds = msg.elementIds || [msg.value]; // Support both new and old format
      let foundElement = null;
      let usedElementId = null;

      // Try each elementId until we find one that exists
      for (const elementId of elementIds) {
        const element = await figma.getNodeByIdAsync(elementId);
        if (element) {
          foundElement = element;
          usedElementId = elementId;
          break;
        }
      }

      if (foundElement) {
        try {
          figma.currentPage.selection = [foundElement as SceneNode];
          figma.viewport.scrollAndZoomIntoView([foundElement]);
        } catch (err) {
          let currentNode = foundElement;
          while (
            currentNode &&
            currentNode.parent &&
            currentNode.parent.type !== "PAGE"
          ) {
            currentNode = currentNode.parent;
          }

          const elementPage = currentNode.parent;
          const pageName = elementPage ? elementPage.name : "unknown";
          figma.ui.postMessage({
            type: "elementonDifferentPage",
            message: `Can't jump to Element ${usedElementId} because it is on a different page: "${pageName}"`,
          });
        }
      } else {
        const uniqueId = msg.uniqueId || "unknown";
        figma.ui.postMessage({
          type: "elementNotFound",
          message: `No elements found for UniqueID ${uniqueId} on the canvas`,
        });
      }
      break;
    }
    case "newVersion": {
      const version = await figma.saveVersionHistoryAsync(
        "Release Version",
        "This version was created by the Mercedes release plugin.",
      );
      // console.log("creatign new version ", version)
      figma.ui.postMessage({
        type: "newVersionCreated",
        versionId: version.id,
        releaseRequestId: msg.releaseRequestId,
        userStory: msg.userStory,
        releaseNotes: msg.releaseNotes,
        requirements: msg.requirements,
        notifyUserIds: msg.notifyUserIds,
        documentKey: figma.fileKey,
        documentName: figma.root.name,
      });
      break;
    }
    case "OPEN_VERSION": {
      // console.log("open ", msg.link);
      figma.openExternal(msg.link);
    }
    case "elements-exist": {
      const testedElements = await Promise.all(
        msg.data.elements.map(
          async (elementsForUniqueId: { uniqueId: string, elementId: string }[]) => {
            // Check if ANY of the elementIds for this uniqueId exist
            const existenceChecks = await Promise.all(
              elementsForUniqueId.map(el => figma.getNodeByIdAsync(el.elementId))
            );

            return {
              uniqueId: elementsForUniqueId[0]?.uniqueId,
              elementIds: elementsForUniqueId.map(el => el.elementId),
              exists: existenceChecks.some(node => Boolean(node)) // TRUE if at least one element exists
            };
          }
        ),
      );
      console.log("elementCheck: ", testedElements);
      return figma.ui.postMessage({
        type: "elements-exist",
        testedElements
      });
    }
    case "remove_storage": {
      const figmaTokenKey = "figma_access_token";
      const cddbTokenKey = "cddb_access_token";
      figma.clientStorage.deleteAsync(figmaTokenKey);
      figma.clientStorage.deleteAsync(cddbTokenKey);
      break;
    }
    default: {
      figma.clientStorage
        .setAsync(msg.data.key, msg.data.value)
        .then(() => {
          console.log("Data has been stored.");
        })
        .catch((err) => {
          console.log("error while storing data", err);
        });
      break;
    }
  }
}
