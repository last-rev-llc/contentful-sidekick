import type { ContentScriptContext } from "#imports";
import { onMessage } from "../utils/messaging";
import { getPageContent } from "../utils-document/getPageContent";
import { getMetaTag } from "../utils-document/getMetaTag";

import type { ProtocolMap } from "../utils/messaging";
import {
  initializeContentfulHighlighting,
  cleanup,
} from "../utils/contentHighlight";
import "./style.css";

export default defineContentScript({
  matches: ["*://*/*"],
  runAt: "document_idle",
  async main(context: ContentScriptContext) {
    console.log("[Content] Starting main function");

    // Listen for getMetaTag messages
    onMessage("getMetaTag", async (message) => {
      console.log("[Content] Handling getMetaTag message");
      return getMetaTag(message.data);
    });

    // Listen for getPageContent messages
    onMessage("getPageContent", async () => {
      console.log("[Content] Handling getPageContent message");
      return getPageContent();
    });

    // Initialize content highlighting
    console.log("[Content] Initializing content highlighting...");
    await initializeContentfulHighlighting(context);

    // Handle URL changes (SPA navigation)
    context.addEventListener(window, "wxt:locationchange", async () => {
      console.log("[Content] URL changed, reinitializing content highlighting");
      await initializeContentfulHighlighting(context);
    });

    // Clean up on invalidation
    context.onInvalidated(() => {
      console.log("[Content] Script invalidated, cleaning up...");
      cleanup();
    });

    console.log("[Content] Script initialization complete");
  },
});
