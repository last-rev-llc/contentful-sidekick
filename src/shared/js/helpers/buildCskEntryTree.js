import { each } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {
  CSK_ENTRY_ID_NAME,
  CSK_ENTRY_TYPE_NAME,
  CSK_ENTRY_FIELD_NAME,
  CSK_ENTRY_DISPLAY_TEXT_NAME,
  CSK_ENTRY_UUID_NAME
} from './constants';

function traverseDomNode(jqObj, domEl, results) {
  const isEl = jqObj.is(domEl);
  const children = [];

  if (isEl) {
    const $el = $(domEl);
    const uuid = uuidv4();
    $el.attr(`data-${CSK_ENTRY_UUID_NAME}`, uuid);
    results.push({
      id: $el.data(CSK_ENTRY_ID_NAME),
      field: $el.data(CSK_ENTRY_FIELD_NAME),
      type: $el.data(CSK_ENTRY_TYPE_NAME),
      displayText: $el.data(CSK_ENTRY_DISPLAY_TEXT_NAME),
      uuid,
      children
    });
  }

  if (domEl.children) {
    each(domEl.children, (child) => {
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
