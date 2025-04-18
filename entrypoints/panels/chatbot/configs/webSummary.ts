import { ChatbotConfig } from "../types";

export const webSummary: ChatbotConfig = {
  id: "webSummary",
  title: "Web - Current Page Summary",
  apiHost: "https://lastrev.flowise.theanswer.ai",
  chatflowid: "1cdb9e18-9575-444d-a450-aa6dca68a447",
  urlPatterns: [], // Empty array means it won't be selected automatically
  theme: {
    buttonBackgroundColor: "#FFA000",
    buttonIconColor: "#000000",
    chatWindowBackgroundColor: "#2C2500",
    chatWindowPoweredByTextColor: "#FFFFFF",
    botMessageBackgroundColor: "#FFA000",
    botMessageTextColor: "#000000",
    userMessageBackgroundColor: "#403600",
    userMessageTextColor: "#FFFFFF",
    textInputBackgroundColor: "#FFFFFF",
    textInputTextColor: "#FFA000",
    textInputSendButtonColor: "#FFA000",
    feedbackColor: "#FFA000",
    footerTextColor: "#FFFFFF",
  },
};
