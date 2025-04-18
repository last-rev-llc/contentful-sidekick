import React, { useEffect, useRef, useState } from "react";
import { browser } from "wxt/browser";
import type { Browser } from "#imports";
import { CHATBOT_CONFIGS } from "./configs";
import { ChatbotConfig } from "./types";
import { Message, sendMessage, onMessage } from "../../utils/messaging";
import { sendToChatbot } from "../../utils/chatbot";
import { getCurrentTabUrl } from "../../utils/getCurrentTabUrl";
import "url:https://cdn.jsdelivr.net/npm/aai-embed/dist/web.js";
import { getCurrentTabId } from "@/entrypoints/utils/getCurrentTabId";

const CHATBOT_ELEMENT_ID = "aai-chatbot";

declare global {
  interface Window {
    Chatbot?: {
      initFull: (config: any) => void;
      destroy: () => void;
    };
  }
}

export const ChatbotPanel: React.FC = () => {
  const chatbotRef = useRef<HTMLDivElement>(null);
  const [selectedChatflow, setSelectedChatflow] = useState<string>("auto");
  const [currentChatflowId, setCurrentChatflowId] = useState<string | null>(
    null
  );
  const [currentConfig, setCurrentConfig] = useState<ChatbotConfig>(
    CHATBOT_CONFIGS.get("default")!
  );
  const [pageContent, setPageContent] = useState<{
    html: string;
    text: string;
  } | null>(null);

  const getChatbotConfig = (url: string): ChatbotConfig => {
    try {
      // Find the first config whose patterns match the URL
      const matchingConfig = Array.from(CHATBOT_CONFIGS.values()).find(
        (config) =>
          config.urlPatterns.some((pattern) => new RegExp(pattern).test(url))
      );

      console.log({ url, matchingConfig });

      // Return the matching config or default to the 'default' config
      return matchingConfig || CHATBOT_CONFIGS.get("default")!;
    } catch (error) {
      console.error("[Chatbot] Error matching URL patterns:", error);
      return CHATBOT_CONFIGS.get("default")!;
    }
  };

  const fetchPageContent = async () => {
    try {
      console.log("[Chatbot] Fetching page content");
      const activeTabId = await getCurrentTabId();

      if (!activeTabId) {
        throw new Error("No active tab found");
      }

      // Send message to specific tab
      const content = await sendMessage(
        "getPageContent",
        undefined,
        activeTabId
      );

      setPageContent(content);
    } catch (error) {
      console.error("[Chatbot] Failed to fetch page content:", error);
    }
  };

  const initializeChatbot = async () => {
    try {
      console.log("[Chatbot] Initializing chatbot...");
      const url = await getCurrentTabUrl();

      const config =
        selectedChatflow === "auto"
          ? getChatbotConfig(url)
          : CHATBOT_CONFIGS.get(selectedChatflow)!;

      const shouldReinitialize = true;
      console.log({
        currentChatflowId,
        new: config.chatflowid,
        shouldReinitialize,
      });
      if (shouldReinitialize) {
        console.log(
          "[Chatbot] Reinitializing with new config:",
          config.chatflowid
        );

        // Remove old chatbot instance if it exists
        if (window.Chatbot?.destroy) {
          window.Chatbot.destroy();
        }

        // Create new chatbot element
        let chatbotElement = document.getElementById(CHATBOT_ELEMENT_ID);
        if (!chatbotElement && chatbotRef.current) {
          chatbotElement = document.createElement("aai-fullchatbot");
          chatbotElement.id = CHATBOT_ELEMENT_ID;
          chatbotRef.current.appendChild(chatbotElement);
        }

        console.log("[Chatbot] Using page content:", pageContent);

        const initConfig = {
          apiHost: config.apiHost,
          chatflowid: config.chatflowid,
          chatflowConfig: {
            returnSourceDocuments: false,
            includedDomains: {
              exaSearch_0: url ? new URL(url).hostname : "",
            },
            promptValues: {
              htmlRawBody: pageContent?.html || "",
              webContentText: pageContent?.text || "",
              url: url || "",
              additional_instructions: "Always talk like a princess",
            },
            ...(config.overrideConfig || {}),
          },
          theme: {
            customCSS: `style + div { height: calc(100dvh - 120px)} !important; }`,
            button: {
              size: "small",
              backgroundColor: config.theme.buttonBackgroundColor,
              iconColor: config.theme.buttonIconColor,
              bottom: 10,
              right: 10,
            },
            chatWindow: {
              welcomeMessage: `You are on domain: ${
                url ? new URL(url).hostname : ""
              }`,
              showTitle: true,
              backgroundColor: config.theme.chatWindowBackgroundColor,
              width: -1,
              height: -1,
              fontSize: 12,
              botMessage: {
                backgroundColor: config.theme.botMessageBackgroundColor,
                textColor: config.theme.botMessageTextColor,
                showAvatar: false,
              },
              userMessage: {
                backgroundColor: config.theme.userMessageBackgroundColor,
                textColor: config.theme.userMessageTextColor,
                showAvatar: false,
              },
              textInput: {
                backgroundColor: config.theme.textInputBackgroundColor,
                textColor: config.theme.textInputTextColor,
                sendButtonColor: config.theme.textInputSendButtonColor,
                autoFocus: true,
              },
              feedback: {
                color: config.theme.feedbackColor,
              },
              footer: {
                textColor: config.theme.footerTextColor,
              },
            },
          },
        };

        console.log(initConfig);

        // Initialize the chatbot if available
        if (window.Chatbot?.initFull) {
          window.Chatbot.initFull(initConfig);
          console.log("[Chatbot] Initialized with config:", config.chatflowid);

          // Only update the ID after successful initialization
          setCurrentChatflowId(config.chatflowid);
        } else {
          console.error(
            "[Chatbot] Chatbot initialization function not available"
          );
          setCurrentChatflowId(null);
        }
      } else {
        console.log(
          "[Chatbot] No need to reinitialize, config unchanged:",
          config.chatflowid
        );
      }
    } catch (error) {
      console.error("[Chatbot] Failed to initialize chatbot:", error);
      // Reset the ID if initialization failed
      setCurrentChatflowId(null);
    }
  };

  useEffect(() => {
    console.log("[Chatbot] Setting up panel...");

    // Fetch page content when component mounts or selection changes
    fetchPageContent();

    // Initialize chatbot when component mounts or selection changes
    const initTimer = setTimeout(() => {
      initializeChatbot();
    }, 100);

    // Set up message listeners
    const unsubscribeTabChange = onMessage("tabUrlChanged", async () => {
      console.log("[Chatbot] Received tab URL change notification");
      await fetchPageContent();
      initializeChatbot();
    });

    // Set up message listener for chatbot messages using the sendToChatbot utility
    const unsubscribeChatbot = onMessage("sendToChatbot", async (message) => {
      console.log("[Chatbot] Handling sendToChatbot message:", message);
      try {
        await sendToChatbot(message.data);
      } catch (error) {
        console.error("[Chatbot] Failed to send message:", error);
      }
    });

    // Cleanup
    return () => {
      console.log("[Chatbot] Cleaning up panel...");
      clearTimeout(initTimer);
      unsubscribeTabChange();
      unsubscribeChatbot();
      if (window.Chatbot) {
        window.Chatbot.destroy();
      }
      setCurrentChatflowId(null);
    };
  }, [selectedChatflow]);

  // Update current config when selection changes
  useEffect(() => {
    const newConfig =
      selectedChatflow === "auto"
        ? CHATBOT_CONFIGS.get("default")!
        : CHATBOT_CONFIGS.get(selectedChatflow)!;
    setCurrentConfig(newConfig);
  }, [selectedChatflow]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: currentConfig.theme.buttonBackgroundColor,
          position: "absolute",
          zIndex: 20000,
          maxWidth: "calc(100% - 120px)",
          height: "50px",
          display: "flex",
        }}
      >
        <select
          value={selectedChatflow}
          onChange={(e) => setSelectedChatflow(e.target.value)}
          style={{
            width: "100%",
            padding: "0 1rem",
            border: "none",
            backgroundColor: currentConfig.theme.buttonBackgroundColor,
            color: currentConfig.theme.buttonIconColor,
            fontSize: "1rem",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="auto">Auto (Based on URL)</option>
          {Array.from(CHATBOT_CONFIGS.entries()).map(([id, config]) => (
            <option key={id} value={id}>
              {config.title}
            </option>
          ))}
        </select>
      </div>
      <div
        ref={chatbotRef}
        className="chatbot-panel"
        style={{
          flex: 1,
          minHeight: 0,
        }}
      />
    </div>
  );
};
