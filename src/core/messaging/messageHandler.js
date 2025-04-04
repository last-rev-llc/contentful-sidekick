import { logger } from '../utils/logger';
import { MessageError, handleMessageError } from './errorHandler';

/**
 * Handles message passing between different parts of the extension
 */
class MessageHandler {
  constructor() {
    this.handlers = new Map();
    this.initializeListener();
  }

  /**
   * Register a handler for a specific message type
   * @param {string} messageType - The type of message to handle
   * @param {Function} handler - The handler function
   */
  registerHandler(messageType, handler) {
    logger.debug('Registering message handler', { messageType });
    this.handlers.set(messageType, handler);
  }

  /**
   * Send a message through chrome.runtime
   * @param {Object} message - The message to send
   * @returns {Promise<*>} Response from the message handler
   */
  static async sendMessage(message) {
    try {
      logger.debug('Sending runtime message', { message });
      const response = await chrome.runtime.sendMessage(message);
      logger.debug('Received runtime message response', { response });
      return response;
    } catch (error) {
      handleMessageError(error, 'Error sending runtime message', { message });
      throw error;
    }
  }

  /**
   * Send a message to a specific tab
   * @param {number} tabId - The ID of the tab to send the message to
   * @param {Object} message - The message to send
   * @returns {Promise<*>} Response from the tab
   */
  static async sendTabMessage(tabId, message) {
    try {
      logger.debug('Sending tab message', { tabId, message });
      const response = await chrome.tabs.sendMessage(tabId, message);
      logger.debug('Received tab message response', { tabId, response });
      return response;
    } catch (error) {
      handleMessageError(error, 'Error sending tab message', { tabId, message });
      throw error;
    }
  }

  /**
   * Initialize the message listener
   */
  initializeListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender).then(sendResponse);
      return true; // Keep the message channel open for async response
    });
  }

  /**
   * Handle an incoming message
   * @param {Object} message - The received message
   * @param {Object} sender - The sender of the message
   * @returns {Promise<*>} Response to the message
   */
  async handleMessage(message, sender) {
    const { type } = message;
    logger.debug('Handling message', { type, message, sender });

    const handler = this.handlers.get(type);
    if (!handler) {
      const error = new MessageError(`No handler registered for message type: ${type}`);
      handleMessageError(error, 'Message handler not found', { type });
      throw error;
    }

    try {
      const response = await handler(message, sender);
      logger.debug('Handler processed message', { type, response });
      return response;
    } catch (error) {
      handleMessageError(error, 'Error in message handler', { type, message });
      throw error;
    }
  }

  /**
   * Send a message to all open tabs and collect their responses
   * @param {Object} message - The message to broadcast
   * @returns {Promise<Array>} Array of responses from tabs
   */
  static async broadcastToTabs(message) {
    try {
      const tabs = await chrome.tabs.query({});
      logger.debug('Broadcasting message to tabs', { message, tabCount: tabs.length });

      const responses = await Promise.all(
        tabs.map(async tab => {
          try {
            return await MessageHandler.sendTabMessage(tab.id, message);
          } catch (error) {
            logger.warn('Error sending message to tab', { tabId: tab.id, error });
            return null;
          }
        })
      );

      return responses.filter(response => response !== null);
    } catch (error) {
      handleMessageError(error, 'Error broadcasting to tabs', { message });
      throw error;
    }
  }
}

// Create and export a singleton instance
export const messageHandler = new MessageHandler();
