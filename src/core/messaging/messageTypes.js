/**
 * Core message types that are generic to any extension
 */
export const CoreMessageTypes = {
  TAB: {
    GET_INFO: 'GET_TAB_INFO',
    INFO_UPDATE: 'TAB_INFO_UPDATE',
    PING: 'PING'
  },
  AUTH: {
    STATE_CHANGED: 'AUTH_STATE_CHANGED'
  },
  OPTIONS: {
    OPEN: 'OPEN_OPTIONS_PAGE'
  },
  OAUTH: {
    OPEN_WINDOW: 'OPEN_OAUTH_WINDOW'
  }
};
