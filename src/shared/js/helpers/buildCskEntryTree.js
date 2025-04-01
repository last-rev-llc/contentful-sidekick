// import { each } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {
  CSK_ENTRY_ID_NAME,
  CSK_ENTRY_TYPE_NAME,
  CSK_ENTRY_FIELD_NAME,
  CSK_ENTRY_DISPLAY_TEXT_NAME,
  CSK_ENTRY_UUID_NAME,
  CSK_ENTRY_ERROR
} from './constants';

const parseErrors = $el => {
  try {
    const error = $el.data(CSK_ENTRY_ERROR);
    return error.errors;
  } catch (e) {
    return null;
  }
};

function isValidNode(node) {
  const isValid =
    node && typeof node === 'object' && typeof node.uuid === 'string' && node.uuid.length > 0;
  if (!isValid) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      let reason;
      if (!node) {
        reason = 'node is null/undefined';
      } else if (!node.uuid) {
        reason = 'missing uuid';
      } else {
        reason = 'invalid uuid type';
      }
      console.warn('Invalid node found:', { node, reason });
    }
  }
  return isValid;
}

function traverseDomNode(jqObj, domEl, results) {
  const isEl = jqObj.is(domEl);
  const children = [];

  if (isEl) {
    const $el = $(domEl);
    const prevUuid = $el.attr(`data-${CSK_ENTRY_UUID_NAME}`);
    const uuid = prevUuid || uuidv4();

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating node for element:', {
        el: domEl,
        prevUuid,
        newUuid: uuid,
        data: {
          id: $el.data(CSK_ENTRY_ID_NAME),
          field: $el.data(CSK_ENTRY_FIELD_NAME),
          type: $el.data(CSK_ENTRY_TYPE_NAME),
          displayText: $el.data(CSK_ENTRY_DISPLAY_TEXT_NAME)
        }
      });
    }

    $el.attr(`data-${CSK_ENTRY_UUID_NAME}`, uuid);

    const node = {
      id: $el.data(CSK_ENTRY_ID_NAME),
      field: $el.data(CSK_ENTRY_FIELD_NAME),
      type: $el.data(CSK_ENTRY_TYPE_NAME),
      displayText: $el.data(CSK_ENTRY_DISPLAY_TEXT_NAME),
      errors: parseErrors($el),
      uuid,
      children
    };

    if (isValidNode(node)) {
      results.push(node);
    }
  }

  if (domEl.children) {
    Array.from(domEl.children).forEach(child => {
      traverseDomNode(jqObj, child, isEl ? children : results);
    });
  }
}

export default () => {
  try {
    const tree = [];
    const selector = `[data-${CSK_ENTRY_ID_NAME}],[data-${CSK_ENTRY_TYPE_NAME}],[data-${CSK_ENTRY_FIELD_NAME}],[data-${CSK_ENTRY_DISPLAY_TEXT_NAME}]`;

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Building tree with selector:', selector);
      const $matches = $(selector);
      console.log('Found matching elements:', $matches.length);
    }

    traverseDomNode($(selector), document.body, tree);

    const validTree = tree.filter(isValidNode);

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Final tree:', {
        originalLength: tree.length,
        validLength: validTree.length,
        tree: validTree
      });
    }

    return validTree;
  } catch (error) {
    console.warn('Error building CSK entry tree:', error);
    return [];
  }
};
