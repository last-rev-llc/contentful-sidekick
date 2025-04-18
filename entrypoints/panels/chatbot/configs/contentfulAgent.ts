import { ChatbotConfig } from "../types";

export const contentfulAgent: ChatbotConfig = {
  id: "contentfulAgent",
  title: "Contentful Agent",
  apiHost: "https://lr-staging.studio.theanswer.ai",
  chatflowid: "56945a06-2ea1-4102-a8b4-2dc4d5544deb",
  urlPatterns: [],
  theme: {
    buttonBackgroundColor: "blue",
    buttonIconColor: "#FFFFFF",
    chatWindowBackgroundColor: "#1C2E1C",
    chatWindowPoweredByTextColor: "#FFFFFF",
    botMessageBackgroundColor: "#2E7D32",
    botMessageTextColor: "#FFFFFF",
    userMessageBackgroundColor: "#1E401E",
    userMessageTextColor: "#FFFFFF",
    textInputBackgroundColor: "#FFFFFF",
    textInputTextColor: "#2E7D32",
    textInputSendButtonColor: "#2E7D32",
    feedbackColor: "#2E7D32",
    footerTextColor: "#FFFFFF",
  },
};
