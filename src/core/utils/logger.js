/**
 * Logger utility for consistent logging across the extension
 */
/* eslint-disable no-console */
export const logger = {
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message, ...args) => {
    console.info(`[INFO] ${message}`, ...args);
  },

  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};
