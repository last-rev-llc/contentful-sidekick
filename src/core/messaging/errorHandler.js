import { logger } from '../utils/logger';

/**
 * Custom error class for message-related errors
 */
export class MessageError extends Error {
  constructor(message, type, details = {}) {
    super(message);
    this.name = 'MessageError';
    this.type = type;
    this.details = details;
  }
}

/**
 * Handles message-related errors with consistent logging
 */
export const handleMessageError = (error, context) => {
  if (error instanceof MessageError) {
    logger.error(`Message Error in ${context}`, {
      type: error.type,
      message: error.message,
      details: error.details
    });
  } else {
    logger.error(`Unexpected error in ${context}`, error);
  }
  return {
    success: false,
    error: error.message,
    context
  };
};
