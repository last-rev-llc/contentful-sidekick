export type PanelName = "welcome" | "chatbot" | "element-tree";

declare const chrome: {
  sidePanel?: {
    open?(options?: { windowId?: number }): Promise<void>;
  };
};
