declare module "../../../../vendor/web" {
  interface ChatbotTheme {
    button: {
      size: string;
      backgroundColor: string;
      iconColor: string;
      bottom: number;
      right: number;
    };
    chatWindow: {
      showTitle: boolean;
      backgroundColor: string;
      width: number;
      fontSize: number;
      botMessage: {
        backgroundColor: string;
        textColor: string;
        showAvatar: boolean;
        avatarSrc: string;
      };
      userMessage: {
        backgroundColor: string;
        textColor: string;
        showAvatar: boolean;
      };
      textInput: {
        backgroundColor: string;
        textColor: string;
        sendButtonColor: string;
        autoFocus: boolean;
      };
      feedback: {
        color: string;
      };
      footer: {
        textColor: string;
      };
    };
  }

  interface ChatbotConfig {
    apiHost: string;
    chatflowid: string;
    theme: ChatbotTheme;
  }

  interface Chatbot {
    initFull(config: ChatbotConfig): void;
    destroy(): void;
  }

  const chatbot: Chatbot;
  export default chatbot;
}
