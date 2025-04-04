import { CoreMessageTypes } from '../../../core/messaging/messageTypes';

/**
 * App-specific message types used throughout the extension
 */
const MessageTypes = {
  ...CoreMessageTypes,
  SIDEPANEL: {
    UPDATE: 'UPDATE_SIDEPANEL',
    GET_TREE: 'GET_ELEMENT_TREE'
  },
  CONTENT: {
    INIT: 'INIT_SIDEKICK',
    REFRESH: 'REFRESH_CONTENT'
  },
  BUG_REPORT: {
    SUBMIT: 'SUBMIT_BUG_REPORT'
  }
};

export default MessageTypes;
