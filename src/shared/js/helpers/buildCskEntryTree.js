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

const parseErrors = ($el) => {
  try {
    const error = $el.data(CSK_ENTRY_ERROR);
    return error.errors;
  } catch (e) {
    return null;
  }
};

function traverseDomNode(jqObj, domEl, results) {
  const isEl = jqObj.is(domEl);
  const children = [];

  if (isEl) {
    const $el = $(domEl);
    const prevUuid = $el.attr(`data-${CSK_ENTRY_UUID_NAME}`);
    const uuid = prevUuid || uuidv4();

    $el.attr(`data-${CSK_ENTRY_UUID_NAME}`, uuid);

    results.push({
      id: $el.data(CSK_ENTRY_ID_NAME),
      field: $el.data(CSK_ENTRY_FIELD_NAME),
      type: $el.data(CSK_ENTRY_TYPE_NAME),
      displayText: $el.data(CSK_ENTRY_DISPLAY_TEXT_NAME),
      errors: parseErrors($el),
      uuid,
      children
    });
  }

  if (domEl.children) {
    Array.from(domEl.children).forEach((child) => {
      traverseDomNode(jqObj, child, isEl ? children : results);
    });
  }
}

export default () => {
  const tree = [];

  traverseDomNode(
    $(
      `[data-${CSK_ENTRY_ID_NAME}],[data-${CSK_ENTRY_TYPE_NAME}],[data-${CSK_ENTRY_FIELD_NAME}],[data-${CSK_ENTRY_DISPLAY_TEXT_NAME}]`
    ),
    document.body,
    tree
  );

  return tree;
};
