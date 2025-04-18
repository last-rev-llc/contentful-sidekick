import { PanelName } from "./types";

export async function navigateToPanel(panel: PanelName): Promise<void> {
  const paths: Record<PanelName, string> = {
    welcome: "sidepanel.html",
    chatbot: "sidepanel.html?panel=chatbot",
    "element-tree": "sidepanel.html?panel=element-tree",
  };

  try {
    await browser.runtime.sendMessage({
      type: "NAVIGATE_PANEL",
      path: paths[panel],
    });
  } catch (error) {
    console.error("Failed to navigate to panel:", error);
  }
}
