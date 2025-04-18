import { ChatbotConfig } from "../types";

export const defaultConfig: ChatbotConfig = {
  id: "default",
  title: "Default Assistant",
  apiHost: "https://lr-production.studio.theanswer.ai",
  chatflowid: "9530dc18-17ee-4ff8-90ae-f1c786bdcea3",
  urlPatterns: [], // Matches any URL as fallback
  theme: {
    buttonBackgroundColor: "rgb(0, 0, 0)",
    buttonIconColor: "#FFFFFF",
    chatWindowBackgroundColor: "#333333",
    chatWindowPoweredByTextColor: "#FFFFFF",
    botMessageBackgroundColor: "#808080",
    botMessageTextColor: "#FFFFFF",
    userMessageBackgroundColor: "#1A1A1A",
    userMessageTextColor: "#FFFFFF",
    textInputBackgroundColor: "#FFFFFF",
    textInputTextColor: "#000000",
    textInputSendButtonColor: "#000000",
    feedbackColor: "#000000",
    footerTextColor: "#FFFFFF",
  },
};
