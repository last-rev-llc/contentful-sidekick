// AAI Embed Web Component
class AAIFullChatbot extends HTMLElement {
  constructor() {
    super();
    this.chatflowid = this.getAttribute('data-chatflowid');
    this.apihost = this.getAttribute('data-apihost');
  }

  connectedCallback() {
    this.init();
  }

  async init() {
    try {
      const response = await fetch(`${this.apihost}/api/v1/prediction/${this.chatflowid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: '',
          history: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize chat');
      }

      // Create chat interface
      this.createChatInterface();
    } catch (error) {
      console.error('Error initializing chat:', error);
      this.innerHTML = '<p>Failed to load chat interface</p>';
    }
  }

  createChatInterface() {
    // Create chat container
    const container = document.createElement('div');
    container.style.cssText = 'height: 100%; display: flex; flex-direction: column;';

    // Create messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.style.cssText = 'flex: 1; overflow-y: auto; padding: 1rem;';
    messagesContainer.id = 'chat-messages';

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'padding: 1rem; border-top: 1px solid #eee;';

    // Create input and button
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your message...';
    input.style.cssText = 'width: calc(100% - 70px); padding: 0.5rem;';

    const button = document.createElement('button');
    button.textContent = 'Send';
    button.style.cssText = 'width: 60px; margin-left: 10px; padding: 0.5rem;';

    // Add event listeners
    button.addEventListener('click', () => this.sendMessage(input.value));
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        this.sendMessage(input.value);
      }
    });

    // Assemble the interface
    inputContainer.appendChild(input);
    inputContainer.appendChild(button);
    container.appendChild(messagesContainer);
    container.appendChild(inputContainer);
    this.appendChild(container);
  }

  async sendMessage(message) {
    if (!message.trim()) return;

    const input = this.querySelector('input');
    input.value = '';

    // Add user message to chat
    this.addMessage('user', message);

    try {
      const response = await fetch(`${this.apihost}/api/v1/prediction/${this.chatflowid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: message,
          history: this.getMessageHistory()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      this.addMessage('bot', data.text || 'No response');
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('bot', 'Sorry, there was an error processing your message.');
    }
  }

  addMessage(type, content) {
    const messagesContainer = this.querySelector('#chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.style.cssText = `
      margin: 0.5rem 0;
      padding: 0.5rem;
      border-radius: 4px;
      ${type === 'user' ? 'background: #e3f2fd; margin-left: 20%;' : 'background: #f5f5f5; margin-right: 20%;'}
    `;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  getMessageHistory() {
    const messages = this.querySelectorAll('.chat-message');
    return Array.from(messages).map(msg => ({
      type: msg.classList.contains('user') ? 'user' : 'bot',
      message: msg.textContent
    }));
  }
}

// Register the web component
customElements.define('aai-fullchatbot', AAIFullChatbot);
