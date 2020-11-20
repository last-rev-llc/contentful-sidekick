import React from 'react';
import getContentfulItemUrl from '../../helpers/getContentfulItemUrl';
import { resetBlur, setBlur } from '../../helpers/blur';
import { CSK_ENTRY_ID_NAME, CSK_ENTRY_SELECTOR, CSK_ENTRY_UUID_NAME } from '../../helpers/constants';

export const handleCskEntryMouseenter = ({ setSelected }) => (e) => {
  if (!e.currentTarget) return;
  const $ct = $(e.currentTarget);
  const id = $ct.data(CSK_ENTRY_ID_NAME);
  const url = id ? getContentfulItemUrl(id) : null;
  let uuid = $(e.target).data(CSK_ENTRY_UUID_NAME);
  if (!uuid) {
    // The mouse enter target might not be the element with sidekick props
    // So we look for it on the parents
    const $parentEl = $(e.target).parents(`[data-${CSK_ENTRY_UUID_NAME}]`);
    uuid = $($parentEl[0]).data(CSK_ENTRY_UUID_NAME);
  }
  setBlur($(e.target), url);
  setSelected(uuid);
};
export const handleCskEntryMouseleave = ({ setSelected }) => (e) => {
  if (e.toElement && e.toElement.getAttribute('id') === 'csk-blur-actions') {
    return;
  }
  if (!e.currentTarget) {
    return;
  }
  setSelected();
  resetBlur();
};
export const handleActionsMouseleave = ({ setSelected }) => (e) => {
  if (e.toElement && $(CSK_ENTRY_SELECTOR).is(e.toElement)) {
    return;
  }
  resetBlur();
  setSelected();
};

export const ElementHighlighter = ({ setSelected }) => {
  React.useEffect(() => {
    $('body')
      .on('mouseenter', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter({ setSelected }))
      .on('mouseleave', CSK_ENTRY_SELECTOR, handleCskEntryMouseleave({ setSelected }))
      .on('mouseover', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter({ setSelected }));

    $('#csk-blur-actions').on('mouseleave', handleActionsMouseleave);
  }, []);
  return (
    <>
      {['top', 'bottom', 'left', 'right'].map((dir) => (
        <div id={`csk-blur-${dir}`} key={dir} className={`csk-blur csk-blur-${dir}`} />
      ))}
      <a target="_blank" id="csk-blur-actions">
        Edit
      </a>
    </>
  );
};
