import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import HeightIcon from '@mui/icons-material/Height';
import { logger } from '../../../../core/utils/logger';

const settings = {
  chatflowid: 'f767158b-775c-4e6b-92ea-fc78e9b0494a',
  apiHost: 'https://lr-production.studio.theanswer.ai',
  chatflowConfig: {
    /* Chatflow Config */
  },
  observersConfig: {
    /* Observers Config */
  },
  theme: {
    button: {
      backgroundColor: '#3B81F6',
      right: 20,
      bottom: 20,
      size: 48,
      dragAndDrop: true,
      iconColor: 'white',
      customIconSrc:
        'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg',
      autoWindowOpen: {
        autoOpen: true,
        openDelay: 2,
        autoOpenOnMobile: false
      }
    },
    tooltip: {
      showTooltip: true,
      tooltipMessage: 'Hi There 👋!',
      tooltipBackgroundColor: 'black',
      tooltipTextColor: 'white',
      tooltipFontSize: 16
    },
    disclaimer: {
      title: 'Disclaimer',
      message:
        'By using this chatbot, you agree to the <a target="_blank" href="https://flowiseai.com/terms">Terms & Condition</a>',
      textColor: 'black',
      buttonColor: '#3b82f6',
      buttonText: 'Start Chatting',
      buttonTextColor: 'white',
      blurredBackgroundColor: 'rgba(0, 0, 0, 0.4)',
      backgroundColor: 'white'
    },
    customCSS: ``,
    chatWindow: {
      showTitle: true,
      showAgentMessages: true,
      title: 'Flowise Bot',
      titleAvatarSrc:
        'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg',
      welcomeMessage: 'Hello! This is custom welcome message',
      errorMessage: 'This is a custom error message',
      backgroundColor: '#ffffff',
      backgroundImage: 'enter image path or link',
      height: 700,
      width: 400,
      fontSize: 16,
      starterPrompts: ['What is a bot?', 'Who are you?'],
      starterPromptFontSize: 15,
      clearChatOnReload: false,
      sourceDocsTitle: 'Sources:',
      renderHTML: true,
      botMessage: {
        backgroundColor: '#f7f8ff',
        textColor: '#303235',
        showAvatar: true,
        avatarSrc:
          'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/parroticon.png'
      },
      userMessage: {
        backgroundColor: '#3B81F6',
        textColor: '#ffffff',
        showAvatar: true,
        avatarSrc:
          'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png'
      },
      textInput: {
        placeholder: 'Type your question',
        backgroundColor: '#ffffff',
        textColor: '#303235',
        sendButtonColor: '#3B81F6',
        maxChars: 50,
        maxCharsWarningMessage:
          'You exceeded the characters limit. Please input less than 50 characters.',
        autoFocus: true,
        sendMessageSound: true,
        sendSoundLocation: 'send_message.mp3',
        receiveMessageSound: true,
        receiveSoundLocation: 'receive_message.mp3'
      },
      feedback: {
        color: '#303235'
      },
      dateTimeToggle: {
        date: true,
        time: true
      },
      footer: {
        textColor: '#303235',
        text: 'Powered by',
        company: 'Flowise',
        companyLink: 'https://flowiseai.com'
      }
    }
  }
};

function Chat() {
  // State to track whether chatbot is visible
  const [isChatVisible, setIsChatVisible] = useState(false);
  // Only track width in dimensions state - height will be set via CSS
  const [width, setWidth] = useState(550);
  const [isDragging, setIsDragging] = useState(false);
  const chatContainerRef = useRef(null);
  const dragInitialRef = useRef(null);

  const { chatflowid, apiHost } = settings;

  if (!chatflowid || !apiHost) return null;

  const ref = React.useRef(null);

  React.useEffect(() => {
    logger.debug('Initializing chat component', {
      window: !!window,
      chatbot: !!window?.Chatbot
    });

    if (!ref.current) return;
    Object.assign(ref.current, settings);
  }, [settings]);

  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatVisible(prev => !prev);
  };

  // Handle mouse down - store initial values in a ref
  const handleMouseDown = e => {
    e.preventDefault();
    if (!chatContainerRef.current) return;

    const rect = chatContainerRef.current.getBoundingClientRect();

    // Store initial mouse position and container width only
    dragInitialRef.current = {
      x: e.clientX,
      width: rect.width
    };

    setIsDragging(true);
  };

  // Handle mouse move - calculate new width based on initial values
  const handleMouseMove = e => {
    if (!isDragging || !dragInitialRef.current || !chatContainerRef.current) return;

    // Get initial values from ref
    const { x: initialX, width: initialWidth } = dragInitialRef.current;

    // Calculate deltas (how far mouse has moved)
    const deltaX = e.clientX - initialX;

    // For top-left resize: negative delta means increasing size
    const newWidth = Math.max(
      350, // min width
      Math.min(window.innerWidth * 0.9, initialWidth - deltaX)
    );

    // Only update width
    setWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragInitialRef.current = null;
  };

  // Add effect for event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Enhanced wheel event handling
  const handleWheel = e => {
    e.stopPropagation();

    // Get the target element
    const chatbotElement = e.currentTarget.querySelector('aai-fullchatbot');
    if (!chatbotElement) return;

    // Calculate if we're at the top or bottom of scroll
    const { scrollTop, scrollHeight, clientHeight } = chatbotElement;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;

    // Only prevent default if trying to scroll beyond boundaries
    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    // Additional preventive measure: prevent body scrolling when chat is visible
    if (isChatVisible) {
      const preventBodyScroll = e => {
        const { target } = e;
        const chatContainer = chatContainerRef.current;

        // If the wheel event originated within our chat container, prevent body scroll
        if (chatContainer && chatContainer.contains(target)) {
          e.preventDefault();
        }
      };

      // Capture phase to ensure we handle before body
      document.addEventListener('wheel', preventBodyScroll, { passive: false });

      return () => {
        document.removeEventListener('wheel', preventBodyScroll);
      };
    }
  }, [isChatVisible]);

  return (
    <>
      {/* Chat container - always rendered but controlled by CSS */}
      <StyledChatBotContainer
        ref={chatContainerRef}
        className={isChatVisible ? 'visible' : 'hidden'}
        width={width}
        isDragging={isDragging}>
        {/* Add resize handle */}
        <StyledResizeHandle className="resize-handle" onMouseDown={handleMouseDown}>
          <HeightIcon />
        </StyledResizeHandle>
        <StyledChatBotContainerInner onWheel={handleWheel}>
          <aai-fullchatbot ref={ref} />
        </StyledChatBotContainerInner>
      </StyledChatBotContainer>

      {/* Chat button - always visible but icon changes */}
      <StyledChatButton onClick={toggleChat}>
        {isChatVisible ? <CloseIcon /> : <ChatIcon />}
      </StyledChatButton>
    </>
  );
}

const StyledChatBotContainerInner = styled('div')`
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-left: 24px;
  height: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  border-radius: 10px;

  /* Critical fix: make this a flex container with the chat taking all available space */
  & aai-fullchatbot {
    flex: 1;
    width: 100%;
    display: block;
    overflow: auto !important; /* Force scrollable content */
    border-radius: 10px;
  }
`;

const StyledChatBotContainer = styled('div')`
  position: fixed;
  bottom: 80px; /* Position above the button */
  right: 20px;
  z-index: 1000;
  min-width: 350px;
  max-width: 100vw;
  width: 90vw; /* Default for xs screens - 90% of viewport width */

  /* Important fix for containing the scroll */
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    width: ${({ width }) => (width ? `${width}px` : '550px')};
    min-height: 300px;
    resize: none;
    user-select: ${({ isDragging }) => (isDragging ? 'none' : 'auto')};
  }

  border-radius: 10px;
  transition: ${({ isDragging }) =>
    isDragging
      ? 'none' /* Disable transitions during dragging for smooth resize */
      : 'opacity 0.3s ease, transform 0.3s ease'};

  &.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }

  &.hidden {
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
  }
`;

const StyledChatButton = styled('button')`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1001;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #2d5e4a;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  &:focus {
    outline: none;
  }
`;

const StyledResizeHandle = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1002;
  cursor: ew-resize; /* Horizontal resize cursor */
  width: 24px;
  height: 24px;
  background-color: #2d5e4a; /* Blue background */
  border-radius: 50%; /* Circular shape */
  display: none;
  align-items: center;
  justify-content: center;
  color: white; /* Icon color */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: rotate(90deg);

  ${({ theme }) => theme.breakpoints.up('sm')} {
    display: flex;
  }

  &:hover {
    background-color: #1976d2; /* Darker blue on hover */
  }

  /* Ensure icon is centered */
  & svg {
    font-size: 16px;
  }
`;

export default Chat;
