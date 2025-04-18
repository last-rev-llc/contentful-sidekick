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
