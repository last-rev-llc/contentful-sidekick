import Chatbot from './vendor/web.js';

const themeColors = {
  default: {
    // Button colors - base color at 100% opacity
    buttonBackgroundColor: 'rgb(0, 0, 0)',
    buttonIconColor: '#FFFFFF', // Contrasting color for black

    // Chat window - base color lightened 20%
    chatWindowBackgroundColor: '#333333',
    chatWindowPoweredByTextColor: '#FFFFFF',

    // Message colors
    // Bot message - base color lightened 50%
    botMessageBackgroundColor: '#808080',
    botMessageTextColor: '#FFFFFF',

    // User message - base color lightened 10%
    userMessageBackgroundColor: '#1A1A1A',
    userMessageTextColor: '#FFFFFF',

    // Input field colors
    textInputBackgroundColor: '#FFFFFF',
    textInputTextColor: '#000000', // Contrasting color for white
    textInputSendButtonColor: '#000000',

    // Additional UI elements
    feedbackColor: '#000000',
    footerTextColor: '#FFFFFF' // Contrasting color for base
  },
  impossible: {
    // Button colors - Impossible Foods red
    buttonBackgroundColor: '#B01B1F',
    buttonIconColor: '#FFFFFF',

    // Chat window - darker red background
    chatWindowBackgroundColor: '#1A0304',
    chatWindowPoweredByTextColor: '#FFFFFF',

    // Message colors
    botMessageBackgroundColor: '#B01B1F', // Impossible Foods red
    botMessageTextColor: '#FFFFFF',

    // User message - darker red
    userMessageBackgroundColor: '#400709',
    userMessageTextColor: '#FFFFFF',

    // Input field colors
    textInputBackgroundColor: '#FFFFFF',
    textInputTextColor: '#B01B1F',
    textInputSendButtonColor: '#B01B1F',

    // Additional UI elements
    feedbackColor: '#B01B1F',
    footerTextColor: '#FFFFFF'
  }
};

console.log({ Chatbot });

// Configuration options based on domain
const CHATBOT_CONFIGS = {
  impossible: {
    apiHost: 'https://lastrev.flowise.theanswer.ai',
    chatflowid: 'e24d5572-a27a-40b9-83fe-19a376535b9d'
  },
  default: {
    apiHost: 'https://lastrev.flowise.theanswer.ai',
    chatflowid: '9530dc18-17ee-4ff8-90ae-f1c786bdcea3'
  }
};

let currentChatflowId = null;

// Function to get the appropriate chatbot config based on domain
const getChatbotConfig = url => {
  try {
    const domain = new URL(url).hostname;
    console.log({ domain });
    return domain.includes('impossiblefoods.com')
      ? CHATBOT_CONFIGS.impossible
      : CHATBOT_CONFIGS.default;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return CHATBOT_CONFIGS.default;
  }
};

// Function to initialize or reinitialize chatbot with config
const initializeChatbot = url => {
  const config = getChatbotConfig(url);

  // Only reinitialize if the chatflowid has changed
  if (currentChatflowId !== config.chatflowid) {
    currentChatflowId = config.chatflowid;

    const chatbotId = 'aai-chatbot';

    // Remove old chatbot instance
    Chatbot.destroy();

    // Create new chatbot element only if it doesn't exist
    let chatbotElement = document.getElementById(chatbotId);
    if (!chatbotElement) {
      const rootElement = document.getElementById('chatbot-root');
      if (!rootElement) {
        console.error('Root element not found');
        return;
      }

      chatbotElement = document.createElement('aai-fullchatbot');
      chatbotElement.id = chatbotId;
      rootElement.appendChild(chatbotElement);
    }

    // Select theme based on domain
    const isImpossibleFoods = new URL(url).hostname.includes('impossiblefoods.com');
    const currentTheme = isImpossibleFoods ? themeColors.impossible : themeColors.default;

    Chatbot.initFull({
      apiHost: config.apiHost,
      chatflowid: config.chatflowid,
      chatflowConfig: {
        /* Chatflow Config */
      },
      observersConfig: {
        /* Observers Config */
      },
      theme: {
        button: {
          size: 'small',
          backgroundColor: currentTheme.buttonBackgroundColor,
          iconColor: currentTheme.buttonIconColor,
          bottom: 10,
          right: 10
        },
        chatWindow: {
          showTitle: true,
          backgroundColor: currentTheme.chatWindowBackgroundColor,
          width: -1,
          fontSize: 12,
          botMessage: {
            backgroundColor: currentTheme.botMessageBackgroundColor,
            textColor: currentTheme.botMessageTextColor,
            showAvatar: true,
            avatarSrc: '/static/images/logos/answerai-logo.png'
          },
          userMessage: {
            backgroundColor: currentTheme.userMessageBackgroundColor,
            textColor: currentTheme.userMessageTextColor,
            showAvatar: false,
            avatarSrc:
              'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png'
          },
          textInput: {
            backgroundColor: currentTheme.textInputBackgroundColor,
            textColor: currentTheme.textInputTextColor,
            sendButtonColor: currentTheme.textInputSendButtonColor,
            autoFocus: true
          },
          feedback: {
            color: currentTheme.feedbackColor
          },
          footer: {
            textColor: currentTheme.footerTextColor
          }
        }
      }
    });
  }
};

// Function to get tab info and meta tags
const getTabInfo = async tabId => {
  try {
    const tab = await chrome.tabs.get(tabId);
    console.log('Current tab URL:', tab.url);

    // Initialize chatbot with the current URL
    initializeChatbot(tab.url);

    const isRestrictedUrl =
      tab.url.startsWith('chrome://') ||
      tab.url.startsWith('chrome-extension://') ||
      tab.url.startsWith('edge://') ||
      tab.url.startsWith('about:');

    let metaTags = null;
    if (!isRestrictedUrl) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            const contentfulSpace = document.querySelector(
              'meta[name="contentful_space"]'
            )?.content;
            const contentfulEnvironment = document.querySelector(
              'meta[name="contentful_environment"]'
            )?.content;
            const pageId = document.querySelector('meta[name="pageId"]')?.content;
            return { contentfulSpace, contentfulEnvironment, pageId };
          }
        });
        metaTags = results[0].result;
      } catch (error) {
        console.log('Could not execute script in tab:', error);
      }
    }

    console.log('Meta tags:', metaTags);

    const info = {
      url: tab.url,
      metaTags,
      isRestrictedUrl
    };

    chrome.runtime.sendMessage({
      type: 'TAB_INFO_UPDATE',
      data: info
    });

    return info;
  } catch (error) {
    console.error('Error getting tab info:', error);
    chrome.runtime.sendMessage({
      type: 'TAB_INFO_UPDATE',
      data: { error: error.message }
    });
    return null;
  }
};

// Function to get current tab and update info
const getCurrentTabInfo = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await getTabInfo(tab.id);
    }
  } catch (error) {
    console.error('Error getting current tab:', error);
  }
};

// Listen for tab updates (URL changes, etc.)
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    getTabInfo(tabId);
  }
});

// Listen for tab activation (switching between tabs)
chrome.tabs.onActivated.addListener(activeInfo => {
  getTabInfo(activeInfo.tabId);
});

// Listen for history state updates
window.addEventListener('popstate', getCurrentTabInfo);

// Listen for requests from the sidepanel
chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'GET_TAB_INFO') {
    getCurrentTabInfo();
  }
});

// Get initial tab info
getCurrentTabInfo();

// Chatbot.init({
//   chatflowid: 'f767158b-775c-4e6b-92ea-fc78e9b0494a',
//   apiHost: 'https://lr-production.studio.theanswer.ai',
//   isFullPage: true
// });

// I need to get the current tab info.  If the domain is impossiblefoods.com it should use the below values for apihost and chatflowid.
// apiHost: 'https://lastrev.flowise.theanswer.ai',
//   chatflowid: 'e24d5572-a27a-40b9-83fe-19a376535b9d',

//   If the domain is anything else it should use these values
//   chatflowid: "9530dc18-17ee-4ff8-90ae-f1c786bdcea3",
//         apiHost: "https://lr-production.studio.theanswer.ai",

// If the current chatflowid is different than the current chatflowid on the page, the chatbot needs to start a new session with the updated values
