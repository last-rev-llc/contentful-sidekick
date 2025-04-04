import { logger } from '../../../core/utils/logger';
import { safeAppendChild, createAndAppendElement, safeRemoveAll } from './dom';
import { buildCskEntryTree } from './buildCskEntryTree';

// Configuration for sidebar elements
const SIDEBAR_ELEMENTS = {
  container: {
    id: 'csk-sidekick'
  },
  overlay: {
    id: 'csk-overlay'
  },
  blurContainers: {
    baseId: 'csk-blur',
    class: 'csk-blur',
    positions: ['top', 'bottom', 'left', 'right']
  },
  blurActions: {
    id: 'csk-blur-actions',
    class: 'hidden',
    innerHTML: '<a id="csk-edit-link" target="_blank" href="#">Edit</a>'
  },
  selectedContainers: {
    baseId: 'csk-selected',
    class: 'csk-selected',
    positions: ['top', 'bottom', 'left', 'right']
  },
  selectedActions: {
    id: 'csk-selected-actions',
    class: 'hidden'
  }
};

let clickHandlersInitialized = false;
let activeHandlers = null;

// Register event handlers for sidebar elements
const registerEventHandlers = handlers => {
  const { onOverlayClick, onEditLinkClick } = handlers;

  if (onOverlayClick) {
    document.getElementById('csk-overlay')?.addEventListener('click', onOverlayClick);
  }

  if (onEditLinkClick) {
    document.getElementById('csk-edit-link')?.addEventListener('click', onEditLinkClick);
  }

  logger.debug('Sidebar event handlers registered');
};

// Clean up event handlers for sidebar elements
const cleanupEventHandlers = handlers => {
  const { onOverlayClick, onEditLinkClick } = handlers;

  if (onOverlayClick) {
    document.getElementById('csk-overlay')?.removeEventListener('click', onOverlayClick);
  }

  if (onEditLinkClick) {
    document.getElementById('csk-edit-link')?.removeEventListener('click', onEditLinkClick);
  }

  logger.debug('Sidebar event handlers cleaned up');
  clickHandlersInitialized = false;
};

// Initialize click handlers for sidebar elements
const initializeClickHandlers = () => {
  if (clickHandlersInitialized) {
    logger.debug('Sidebar click handlers already initialized');
    return;
  }

  const handlers = {
    onOverlayClick: () => {
      logger.debug('Overlay clicked');
      buildCskEntryTree();
    },
    onEditLinkClick: event => {
      event.preventDefault();
      logger.debug('Edit link clicked');
      buildCskEntryTree();
    }
  };

  registerEventHandlers(handlers);
  clickHandlersInitialized = true;
  logger.info('Sidebar click handlers initialized');

  return handlers; // Return handlers so they can be cleaned up later
};

// Helper function to create and append a single element
const createAndAppendSidebarElement = config => {
  const element = createAndAppendElement(config.id, config.class);
  if (!element) return false;

  if (config.innerHTML) {
    element.innerHTML = config.innerHTML;
  }

  return safeAppendChild(document.body, element);
};

// Helper function to create and append multiple position-based elements
const createAndAppendPositionElements = config => {
  const { baseId, class: className, positions } = config;
  let success = true;

  positions.forEach(position => {
    const id = `${baseId}-${position}`;
    const element = createAndAppendElement(id, className);
    if (!element || !safeAppendChild(document.body, element)) {
      logger.error(`Failed to create ${baseId} container for ${position}`);
      success = false;
    }
  });

  return success;
};

// Helper function to clean up existing elements
const cleanupExistingElements = () => {
  const existingElements = document.querySelectorAll('[id^="csk-"]');
  if (existingElements.length > 0) {
    logger.warn('Found existing sidekick elements, cleaning up first');
    existingElements.forEach(element => element.remove());
  }
};

// Add sidekick container and related DOM elements
export const loadSidebar = () => {
  try {
    // Check if document and body are available
    if (!document || !document.body) {
      logger.error('Document or body not available');
      return false;
    }

    // Clean up any existing elements
    cleanupExistingElements();

    // Mark the page as initialized
    document.body.setAttribute('data-init-csk', 'true');
    logger.debug('Added data-init-csk attribute to body');

    // Create main container
    if (!createAndAppendSidebarElement(SIDEBAR_ELEMENTS.container)) {
      throw new Error('Failed to create sidekick container');
    }

    // Create overlay
    if (!createAndAppendSidebarElement(SIDEBAR_ELEMENTS.overlay)) {
      throw new Error('Failed to create overlay container');
    }

    // Create blur containers
    createAndAppendPositionElements(SIDEBAR_ELEMENTS.blurContainers);

    // Create blur actions container
    createAndAppendSidebarElement(SIDEBAR_ELEMENTS.blurActions);

    // Create selected containers
    createAndAppendPositionElements(SIDEBAR_ELEMENTS.selectedContainers);

    // Create selected actions container
    createAndAppendSidebarElement(SIDEBAR_ELEMENTS.selectedActions);

    // Initialize click handlers after DOM elements are created
    activeHandlers = initializeClickHandlers();

    logger.info('Sidebar loaded successfully');
    return true;
  } catch (err) {
    logger.error('Error in loadSidebar', err);
    return false;
  }
};

// Helper function to safely remove elements by selector pattern
const removeElementsByPattern = pattern => {
  try {
    const elements = document.querySelectorAll(pattern);
    elements.forEach(element => {
      try {
        element.remove();
        logger.debug(`Removed element with id '${element.id}'`);
      } catch (err) {
        logger.error(`Error removing element ${element.id}`, err);
      }
    });
    return true;
  } catch (err) {
    logger.error(`Error removing elements matching ${pattern}`, err);
    return false;
  }
};

// Remove all sidekick-related DOM elements
export const removeSidebar = () => {
  try {
    // Check if document and body are available
    if (!document || !document.body) {
      logger.error('Document or body not available');
      return false;
    }

    // Clean up event handlers if they exist
    if (activeHandlers) {
      cleanupEventHandlers(activeHandlers);
      activeHandlers = null;
    }

    // Remove all elements that start with 'csk-'
    removeElementsByPattern('[id^="csk-"]');

    // Remove elements by class for completeness
    const classSelectors = ['.csk-blur', '.csk-selected'];
    classSelectors.forEach(selector => {
      if (!safeRemoveAll(selector)) {
        logger.warn(`Elements with ${selector} could not be removed`);
      }
    });

    // Remove initialization attribute
    document.body.removeAttribute('data-init-csk');
    logger.debug('Removed data-init-csk attribute from body');

    logger.info('Sidebar removed successfully');
    return true;
  } catch (err) {
    logger.error('Error in removeSidebar', err);
    return false;
  }
};
