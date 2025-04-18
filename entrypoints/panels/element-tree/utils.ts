import { browser } from "wxt/browser";
import { TreeNode } from "./types";
import { getMetaTagValue } from "@/entrypoints/utils/getMetaTagValue";

export async function buildElementTree(): Promise<TreeNode[]> {
  try {
    console.debug("🌳 [Element Tree Extension] Starting element tree build");

    // Get the active tab
    const [activeTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.debug("🌳 [Element Tree Extension] Active tab:", activeTab);

    if (!activeTab?.id) {
      console.debug("🌳 [Element Tree Extension] No active tab found");
      return [];
    }

    // Execute script to get the DOM tree
    const result = await browser.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {
        // console.debug("🌳 [Element Tree Injected] Script started executing");

        // Define the TreeNode interface in the injected context
        interface InjectedTreeNode {
          id: string;
          uuid: string;
          type: string;
          field?: string;
          displayText?: string;
          errors?: Error[] | null;
          children: InjectedTreeNode[];
        }

        // Define constants in the injected context
        const CSK_ENTRY_ID_NAME = "csk-entry-id";
        const CSK_ENTRY_FIELD_NAME = "csk-entry-field";
        const CSK_ENTRY_TYPE_NAME = "csk-entry-type";
        const CSK_ENTRY_DISPLAY_TEXT_NAME = "csk-entry-display-text";
        const CSK_ENTRY_UUID_NAME = "csk-entry-uuid";
        const CSK_ENTRY_ERROR = "csk-error";

        // Create a selector that matches any element with CSK attributes
        const CSK_SELECTOR = [
          `[data-${CSK_ENTRY_ID_NAME}]`,
          `[data-${CSK_ENTRY_TYPE_NAME}]`,
          `[data-${CSK_ENTRY_FIELD_NAME}]`,
        ].join(",");

        function parseErrors(element: Element): Error[] | null {
          try {
            const error = element.getAttribute(`data-${CSK_ENTRY_ERROR}`);
            return error ? JSON.parse(error).errors : null;
          } catch (e) {
            console.error(
              "🌳 [Element Tree Injected] Error parsing entry errors:",
              e
            );
            return null;
          }
        }

        function traverseDomNode(
          selector: string,
          domEl: Element,
          results: InjectedTreeNode[]
        ): void {
          const isEl = domEl.matches(selector);
          const children: InjectedTreeNode[] = [];

          if (isEl) {
            const prevUuid = domEl.getAttribute(`data-${CSK_ENTRY_UUID_NAME}`);
            const uuid = prevUuid || crypto.randomUUID();

            domEl.setAttribute(`data-${CSK_ENTRY_UUID_NAME}`, uuid);

            const node = {
              id: domEl.getAttribute(`data-${CSK_ENTRY_ID_NAME}`) || "",
              field:
                domEl.getAttribute(`data-${CSK_ENTRY_FIELD_NAME}`) || undefined,
              type:
                domEl.getAttribute(`data-${CSK_ENTRY_TYPE_NAME}`) || "unknown",
              displayText:
                domEl.getAttribute(`data-${CSK_ENTRY_DISPLAY_TEXT_NAME}`) ||
                undefined,
              errors: parseErrors(domEl),
              uuid,
              children,
            };

            // console.debug("🌳 [Element Tree Injected] Found element:", {
            //   tagName: domEl.tagName,
            //   id: node.id,
            //   type: node.type,
            //   field: node.field,
            //   uuid: node.uuid,
            // });

            results.push(node);
          }

          if (domEl.children) {
            Array.from(domEl.children).forEach((child) => {
              traverseDomNode(selector, child, isEl ? children : results);
            });
          }
        }

        // Log all elements with data attributes for debugging
        // console.debug(
        //   "🌳 [Element Tree Injected] Scanning page for elements with data attributes:"
        // );
        const allElements = document.querySelectorAll(CSK_SELECTOR);
        // console.debug(
        //   `🌳 [Element Tree Injected] Found ${allElements.length} elements with CSK attributes`
        // );

        // allElements.forEach((el) => {
        //   console.debug(
        //     "🌳 [Element Tree Injected] Found element with data attributes:",
        //     {
        //       tagName: el.tagName,
        //       id: el.getAttribute(`data-${CSK_ENTRY_ID_NAME}`),
        //       type: el.getAttribute(`data-${CSK_ENTRY_TYPE_NAME}`),
        //       field: el.getAttribute(`data-${CSK_ENTRY_FIELD_NAME}`),
        //       html: el.outerHTML.slice(0, 100) + "...",
        //     }
        //   );
        // });

        const tree: InjectedTreeNode[] = [];
        // console.debug(
        //   "🌳 [Element Tree Injected] Using selector:",
        //   CSK_SELECTOR
        // );
        traverseDomNode(CSK_SELECTOR, document.body, tree);

        // console.debug("🌳 [Element Tree Injected] Tree building completed", {
        //   nodeCount: tree.length,
        //   treeJson: JSON.stringify(tree, null, 2),
        // });

        // Explicitly return the tree
        return tree as InjectedTreeNode[];
      },
    });

    // console.debug(
    //   "🌳 [Element Tree Extension] Script execution result:",
    //   JSON.stringify(result, null, 2)
    // );

    if (!result?.[0]?.result) {
      console.warn(
        "🌳 [Element Tree Extension] No result returned from script"
      );
      return [];
    }

    const finalTree = result[0].result;
    // console.debug(
    //   "🌳 [Element Tree Extension] Final tree:",
    //   JSON.stringify(finalTree, null, 2)
    // );

    return finalTree;
  } catch (error) {
    console.error(
      "🌳 [Element Tree Extension] Error building element tree:",
      error
    );
    return [];
  }
}

interface ContentfulNode {
  id: string;
}

interface ContentfulVarsResponse {
  spaceId: string;
  env: string;
}

// Function to get Contentful meta values from the page
export async function getContentfulMetaValues(): Promise<{
  spaceId: string;
  env: string;
}> {
  try {
    const [activeTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      throw new Error("No active tab found");
    }

    const spaceId = await getMetaTagValue("contentful_space");
    const env = await getMetaTagValue("contentful_environment");

    if (!spaceId || !env) {
      throw new Error("Could not find Contentful meta values");
    }

    return { spaceId, env };
  } catch (error) {
    console.error("Error getting Contentful meta values:", error);
    throw error;
  }
}

export const getContentfulItemUrl = async (
  contentId: string,
  selectedPath: ContentfulNode[] = []
): Promise<string | null> => {
  try {
    const { spaceId: SPACE_ID, env: ENV } = await getContentfulMetaValues();
    if (!SPACE_ID || !ENV) {
      console.warn("Contentful meta tags not found on the page");
      return null;
    }

    // Filter out any undefined or null IDs
    const validPath = selectedPath.filter((node) => node.id);

    // Build the previousEntries parameter if we have valid parent entries
    const previousEntries =
      validPath.length > 0
        ? `?previousEntries=${validPath.map((node) => node.id).join(",")}`
        : "";

    console.log("Building Contentful URL:", {
      contentId,
      parentPath: validPath.map((node) => node.id),
      url: `https://app.contentful.com/spaces/${SPACE_ID}/environments/${ENV}/entries/${contentId}${previousEntries}`,
    });

    return `https://app.contentful.com/spaces/${SPACE_ID}/environments/${ENV}/entries/${contentId}${previousEntries}`;
  } catch (error) {
    console.error("Failed to get Contentful URL:", error);
    return null;
  }
};
