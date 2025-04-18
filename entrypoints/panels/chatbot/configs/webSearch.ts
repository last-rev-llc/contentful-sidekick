import { ChatbotConfig } from "../types";

export const webSearch: ChatbotConfig = {
  id: "webSearch",
  title: "Web Search",
  apiHost: "https://lr-staging.studio.theanswer.ai",
  chatflowid: "2110b776-4f3b-47f6-82c6-43765ec125fe",
  urlPatterns: [],
  theme: {
    buttonBackgroundColor: "#FFD700", // Gold yellow
    buttonIconColor: "#000000",
    chatWindowBackgroundColor: "#2B2500", // Dark yellow-tinted background
    chatWindowPoweredByTextColor: "#FFFFFF",
    botMessageBackgroundColor: "#FFD700", // Gold yellow
    botMessageTextColor: "#000000",
    userMessageBackgroundColor: "#403700", // Darker yellow-tinted background
    userMessageTextColor: "#FFFFFF",
    textInputBackgroundColor: "#FFFFFF",
    textInputTextColor: "#B39700", // Darker gold
    textInputSendButtonColor: "#FFD700", // Gold yellow
    feedbackColor: "#FFD700", // Gold yellow
    footerTextColor: "#FFFFFF",
  },
};
