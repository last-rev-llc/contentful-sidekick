import { defineExtensionMessaging } from "@webext-core/messaging";

export interface ProtocolMap {
  // Meta tag operations
  getMetaTag(name: string): string | null;

  // Page content operations
  getPageContent(): {
    html: string;
    text: string;
  };

  // Chatbot operations
  sendToChatbot(message: string): void;

  // Panel operations
  openPanel(type: "welcome" | "chatbot" | "element-tree"): void;

  // Element tree operations
  updateSelectedPath(uuids: string[]): void;

  // Tab operations
  tabUrlChanged(params: { tabId: number; url: string }): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();

// Export message types for use in other files
export type MessageType = keyof ProtocolMap;
export type Message<T extends MessageType> = {
  type: T;
  data: Parameters<ProtocolMap[T]>[0];
};
