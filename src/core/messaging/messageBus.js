import { logger } from '../utils/logger';

/**
 * Message bus for handling pub/sub events within the extension
 */
class MessageBus {
  constructor() {
    this.subscribers = new Map();
  }

  /**
   * Subscribe to a topic
   * @param {string} topic - The topic to subscribe to
   * @param {Function} callback - The callback to execute when topic is published
   * @returns {Function} Unsubscribe function
   */
  subscribe(topic, callback) {
    logger.debug('Subscribing to topic', { topic });

    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);

    return () => {
      logger.debug('Unsubscribing from topic', { topic });
      this.subscribers.get(topic)?.delete(callback);

      // Clean up empty topics
      if (this.subscribers.get(topic)?.size === 0) {
        this.subscribers.delete(topic);
      }
    };
  }

  /**
   * Publish data to a topic
   * @param {string} topic - The topic to publish to
   * @param {*} data - The data to publish
   */
  publish(topic, data) {
    logger.debug('Publishing to topic', { topic, data });

    const subscribers = this.subscribers.get(topic);
    if (!subscribers) {
      logger.debug('No subscribers for topic', { topic });
      return;
    }

    subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error('Error in message bus subscriber', { topic, error });
      }
    });
  }

  /**
   * Get the number of subscribers for a topic
   * @param {string} topic - The topic to check
   * @returns {number} Number of subscribers
   */
  getSubscriberCount(topic) {
    return this.subscribers.get(topic)?.size || 0;
  }

  /**
   * Clear all subscribers
   */
  clear() {
    logger.debug('Clearing all message bus subscribers');
    this.subscribers.clear();
  }
}

// Create and export a singleton instance
export const messageBus = new MessageBus();
