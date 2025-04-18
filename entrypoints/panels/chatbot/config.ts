export interface ChatbotTheme {
  buttonBackgroundColor: string;
  buttonIconColor: string;
  chatWindowBackgroundColor: string;
  chatWindowPoweredByTextColor: string;
  botMessageBackgroundColor: string;
  botMessageTextColor: string;
  userMessageBackgroundColor: string;
  userMessageTextColor: string;
  textInputBackgroundColor: string;
  textInputTextColor: string;
  textInputSendButtonColor: string;
  feedbackColor: string;
  footerTextColor: string;
}

export interface ChatbotConfig {
  id: string;
  title: string;
  apiHost: string;
  chatflowid: string;
  theme: ChatbotTheme;
  urlPatterns: string[];
  overrideConfig?: any;
}

export interface ChatbotConfigs {
  impossible: ChatbotConfig;
  default: ChatbotConfig;
  webSummary: ChatbotConfig;
  webHtmlSummary: ChatbotConfig;
}

export const CHATBOT_CONFIGS: Record<string, ChatbotConfig> = {
  impossible: {
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
  },
  default: {
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
  },
  webSummary: {
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
  },
  webHtmlSummary: {
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
  },
  contentfulAgent: {
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
  },
  webSearch: {
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
  },
};
