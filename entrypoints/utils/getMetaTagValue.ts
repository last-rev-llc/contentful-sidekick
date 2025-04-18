import { sendMessage } from "./messaging";

export const getMetaTagValue = async (name: string): Promise<string | null> => {
  try {
    const [activeTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      throw new Error("No active tab found");
    }

    // Send message to specific tab
    return await sendMessage("getMetaTag", name, activeTab.id);
  } catch (error) {
    console.error(`Error getting meta tag ${name}:`, error);
    return null;
  }
};
