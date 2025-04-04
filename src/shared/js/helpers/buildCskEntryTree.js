// import { each } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../core/utils/logger';
import {
  CSK_ENTRY_ID_NAME,
  CSK_ENTRY_TYPE_NAME,
  CSK_ENTRY_FIELD_NAME,
  CSK_ENTRY_DISPLAY_TEXT_NAME,
  CSK_ENTRY_UUID_NAME,
  CSK_ENTRY_ERROR
} from './constants';

const parseErrors = el => {
  try {
    const error = el.getAttribute(`data-${CSK_ENTRY_ERROR}`);
    return error ? JSON.parse(error).errors : null;
  } catch (e) {
    return null;
  }
};

function isValidNode(node) {
  const isValid =
    node && typeof node === 'object' && typeof node.uuid === 'string' && node.uuid.length > 0;
  if (!isValid && process.env.NODE_ENV === 'development') {
    let reason;
    if (!node) {
      reason = 'node is null/undefined';
    } else if (!node.uuid) {
      reason = 'missing uuid';
    } else {
      reason = 'invalid uuid type';
    }
    logger.warn('Invalid node found', { node, reason });
  }
  return isValid;
}

function traverseDomNode(domEl, results) {
  const isEl = domEl.matches(
    `[data-${CSK_ENTRY_ID_NAME}], [data-${CSK_ENTRY_TYPE_NAME}], [data-${CSK_ENTRY_FIELD_NAME}], [data-${CSK_ENTRY_DISPLAY_TEXT_NAME}]`
  );
  const children = [];

  if (isEl) {
    const prevUuid = domEl.getAttribute(`data-${CSK_ENTRY_UUID_NAME}`);
    const uuid = prevUuid || uuidv4();

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Creating node for element', {
        el: domEl,
        prevUuid,
        newUuid: uuid,
        data: {
          id: domEl.getAttribute(`data-${CSK_ENTRY_ID_NAME}`),
          field: domEl.getAttribute(`data-${CSK_ENTRY_FIELD_NAME}`),
          type: domEl.getAttribute(`data-${CSK_ENTRY_TYPE_NAME}`),
          displayText: domEl.getAttribute(`data-${CSK_ENTRY_DISPLAY_TEXT_NAME}`)
        }
      });
    }

    domEl.setAttribute(`data-${CSK_ENTRY_UUID_NAME}`, uuid);

    const node = {
      id: domEl.getAttribute(`data-${CSK_ENTRY_ID_NAME}`),
      field: domEl.getAttribute(`data-${CSK_ENTRY_FIELD_NAME}`),
      type: domEl.getAttribute(`data-${CSK_ENTRY_TYPE_NAME}`),
      displayText: domEl.getAttribute(`data-${CSK_ENTRY_DISPLAY_TEXT_NAME}`),
      errors: parseErrors(domEl),
      uuid,
      children
    };

    if (isValidNode(node)) {
      results.push(node);
    }
  }

  if (domEl.children) {
    Array.from(domEl.children).forEach(child => {
      traverseDomNode(child, isEl ? children : results);
    });
  }
}

export const buildCskEntryTree = () => {
  try {
    const tree = [];
    const selector = `[data-${CSK_ENTRY_ID_NAME}], [data-${CSK_ENTRY_TYPE_NAME}], [data-${CSK_ENTRY_FIELD_NAME}], [data-${CSK_ENTRY_DISPLAY_TEXT_NAME}]`;

    if (process.env.NODE_ENV === 'development') {
      const matches = document.querySelectorAll(selector);
      logger.debug('Building tree', {
        selector,
        matchingElements: matches.length
      });
    }

    traverseDomNode(document.body, tree);

    const validTree = tree.filter(isValidNode);

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Tree building completed', {
        originalLength: tree.length,
        validLength: validTree.length,
        tree: validTree
      });
    }

    return validTree;
  } catch (error) {
    logger.error('Error building CSK entry tree', error);
    return [];
  }
};
