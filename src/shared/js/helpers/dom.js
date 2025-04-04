import { logger } from '../../../core/utils/logger';

// Helper function to safely append a child element
export const safeAppendChild = (parent, child) => {
  if (!(parent instanceof Element)) {
    logger.error('Invalid parent element for appendChild', null, parent);
    return false;
  }
  try {
    // Check if an element with the same ID already exists
    if (child.id && document.getElementById(child.id)) {
      logger.warn(`Element with id '${child.id}' already exists`);
      return false;
    }
    parent.appendChild(child);
    logger.debug(`Successfully appended element with id '${child.id}'`);
    return true;
  } catch (err) {
    logger.error('Error appending child element', err);
    return false;
  }
};

// Helper function to safely create and append an element
export const createAndAppendElement = (id, className = null) => {
  try {
    // Check if element already exists
    const existingElement = document.getElementById(id);
    if (existingElement) {
      logger.warn(`Element with id '${id}' already exists`);
      return null;
    }

    const element = document.createElement('div');
    element.setAttribute('id', id);
    if (className) {
      element.setAttribute('class', className);
    }
    logger.debug(`Successfully created element with id '${id}'`);
    return element;
  } catch (err) {
    logger.error(`Error creating element with id ${id}`, err);
    return null;
  }
};

// Helper function to safely remove multiple elements
export const safeRemoveAll = selector => {
  try {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      try {
        element.remove();
        logger.debug(`Removed element with selector '${selector}'`);
      } catch (err) {
        logger.error(`Error removing element with selector ${selector}`, err);
      }
    });
    return true;
  } catch (err) {
    logger.error(`Error in removeAll for selector ${selector}`, err);
    return false;
  }
};
