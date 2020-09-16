import { each } from 'lodash';
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
    results.push({
      id: $el.data(CSK_ENTRY_ID_NAME),
      field: $el.data(CSK_ENTRY_FIELD_NAME),
      type: $el.data(CSK_ENTRY_TYPE_NAME),
      displayText: $el.data(CSK_ENTRY_DISPLAY_TEXT_NAME),
      uuid: $el.data(CSK_ENTRY_UUID_NAME),
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

  traverseDomNode($(`[data-${CSK_ENTRY_UUID_NAME}]`), document.body, tree);

  return tree;
};
