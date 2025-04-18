import { ChatbotConfig } from "../types";

export const impossible: ChatbotConfig = {
  id: "impossible",
  title: "Impossible Foods Assistant",
  apiHost: "https://lastrev.flowise.theanswer.ai",
  chatflowid: "e24d5572-a27a-40b9-83fe-19a376535b9d",
  urlPatterns: [".*impossiblefoods\\.com.*", ".*impossible-foods\\.com.*"],
  theme: {
    buttonBackgroundColor: "#B01B1F",
    buttonIconColor: "#FFFFFF",
    chatWindowBackgroundColor: "#1A0304",
    chatWindowPoweredByTextColor: "#FFFFFF",
    botMessageBackgroundColor: "#B01B1F",
    botMessageTextColor: "#FFFFFF",
    userMessageBackgroundColor: "#400709",
    userMessageTextColor: "#FFFFFF",
    textInputBackgroundColor: "#FFFFFF",
    textInputTextColor: "#B01B1F",
    textInputSendButtonColor: "#B01B1F",
    feedbackColor: "#B01B1F",
    footerTextColor: "#FFFFFF",
  },
};
