import "./types";

export async function openSidePanel(): Promise<void> {
  try {
    if (chrome.sidePanel?.open) {
      await chrome.sidePanel.open();
    }
  } catch (error) {
    console.error("Failed to open side panel:", error);
  }
}
