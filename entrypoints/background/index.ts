import { onMessage, sendMessage } from "../utils/messaging";
import { sendToChatbot } from "../utils/chatbot";

declare const chrome: {
  sidePanel?: {
    setOptions(options: { enabled?: boolean; path?: string }): Promise<void>;
    open?(options?: { windowId?: number }): Promise<void>;
  };
};

export default defineBackground(() => {
  console.log("[Background] Service worker starting...");

  // Initialize side panel when extension is installed or updated
  browser.runtime.onInstalled.addListener(() => {
    console.log(
      "[Background] Extension installed/updated, initializing side panel..."
    );
    if (chrome.sidePanel) {
      chrome.sidePanel
        .setOptions({
          enabled: true,
          path: "sidepanel.html",
        })
        .then(() => {
          console.log("[Background] Side panel initialized successfully");
        })
        .catch((error) => {
          console.error("[Background] Failed to initialize side panel:", error);
        });
    } else {
      console.warn("[Background] chrome.sidePanel API not available");
    }
  });

  // Handle extension icon clicks
  browser.action.onClicked.addListener(async (tab) => {
    console.log("[Background] Extension icon clicked, opening side panel...");
    if (chrome.sidePanel?.open) {
      try {
        await chrome.sidePanel.open({
          windowId: tab.windowId,
        });
        console.log("[Background] Side panel opened successfully");
      } catch (error) {
        console.error("[Background] Failed to open side panel:", error);
      }
    } else {
      console.warn("[Background] chrome.sidePanel.open is not available");
    }
  });

  // Handle panel opening
  onMessage("openPanel", async (message) => {
    console.log("[Background] Handling openPanel message:", message);
    if (chrome.sidePanel) {
      try {
        await chrome.sidePanel.setOptions({
          path: `sidepanel.html?panel=${message.data.type}`,
        });
        console.log(
          "[Background] Panel type updated successfully:",
          message.data.type
        );
      } catch (error) {
        console.error("[Background] Failed to open panel:", error);
        throw error;
      }
    } else {
      console.warn(
        "[Background] chrome.sidePanel API not available for openPanel"
      );
    }
  });

  // Handle sending message to chatbot
  onMessage("sendToChatbot", async (message) => {
    console.log("[Background] Handling sendToChatbot message:", message);
    // Forward the message to all tabs, the panel will pick it up
    const tabs = await browser.tabs.query({});
    console.log(
      "[Background] Forwarding chatbot message to",
      tabs.length,
      "tabs"
    );

    await Promise.all(
      tabs.map(async (tab) => {
        if (tab.id) {
          try {
            await browser.tabs.sendMessage(tab.id, {
              type: "SEND_TO_CHATBOT",
              message: message.data.message,
            });
            console.log("[Background] Message sent to tab:", tab.id);
          } catch (error) {
            console.error(
              `[Background] Failed to send message to tab ${tab.id}:`,
              error
            );
          }
        }
      })
    );
    console.log("[Background] Finished sending chatbot message to all tabs");
  });

  // Add tab URL change listener
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.url) {
      console.log("[Background] Active tab URL changed:", changeInfo.url);
      try {
        // Notify any open panels about the URL change
        await sendMessage("tabUrlChanged", { tabId, url: changeInfo.url });
      } catch (error) {
        console.error(
          "[Background] Failed to send tabUrlChanged message:",
          error
        );
      }
    }
  });

  console.log("[Background] Service worker initialization complete");
});
