import { ChatbotConfig } from "../types";

export const webHtmlSummary: ChatbotConfig = {
  id: "webHtmlSummary",
  title: "Web - Current Page HTML Summary",
  apiHost: "https://lastrev.flowise.theanswer.ai",
  chatflowid: "d0a0dace-9e60-4561-9ba8-9c473a8d8632",
  urlPatterns: [], // Empty array means it won't be selected automatically
  theme: {
    buttonBackgroundColor: "#2E7D32",
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
