import { initializePageStateListeners, initializeMessageListeners } from './helpers/events';

// Initialize listeners when the script loads
initializePageStateListeners();
initializeMessageListeners();

// Note: All other functionality has been moved to helper modules:
// - Authentication: ./helpers/auth.js
// - DOM manipulation: ./helpers/dom.js
// - Event handling: ./helpers/events.js
// - Styles: ./helpers/styles.js
// - Sidekick lifecycle: ./helpers/sidekick.js
