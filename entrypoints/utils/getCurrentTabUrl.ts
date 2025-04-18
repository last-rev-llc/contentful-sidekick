import { browser } from "wxt/browser";

/**
 * Gets the URL of the currently active tab in the current window.
 * Returns an empty string if no active tab is found or if there's an error.
 */
export const getCurrentTabUrl = async (): Promise<string> => {
  try {
    const [activeTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    return activeTab?.url || "";
  } catch (error) {
    console.error("[Utils] Failed to get current tab URL:", error);
    return "";
  }
};
