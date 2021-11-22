import React from 'react';
import throttle from 'lodash/throttle';
import { useContextSelector } from 'use-context-selector';
import getContentfulItemUrl from '../../helpers/getContentfulItemUrl';
import { resetBlur, setBlur } from '../../helpers/blur';
import { CSK_ENTRY_ID_NAME, CSK_ENTRY_SELECTOR, CSK_ENTRY_UUID_NAME } from '../../helpers/constants';
import { TreeStateContext, useTreeUpdater } from './tree-context';

const ElementHighlighter = () => {
  const { setSelected } = useTreeUpdater();
  const selectedPath = useContextSelector(TreeStateContext, (context) => context.selectedPath);
  React.useEffect(() => {
    const handleCskEntryMouseenter = throttle((e) => {
      if (!e.target) return;
      const $ct = $(e.target);
      let id = $ct.data(CSK_ENTRY_ID_NAME);
      let url = id ? getContentfulItemUrl(id, selectedPath) : null;
      let uuid = $(e.target).data(CSK_ENTRY_UUID_NAME);
      if (!uuid) {
        // The mouse enter target might not be the element with sidekick props
        // So we look for it on the parents
        const $parentEl = $(e.target).parents(`[data-${CSK_ENTRY_UUID_NAME}]`);
        uuid = $($parentEl[0]).data(CSK_ENTRY_UUID_NAME);
        id = $($parentEl[0]).data(CSK_ENTRY_ID_NAME);
        url = id ? getContentfulItemUrl(id, selectedPath) : null;
      }
      setBlur($(e.target), url);
      setSelected(uuid);
    }, 300);

    const handleCskEntryMouseleave = throttle((e) => {
      if (e.toElement && e.toElement.getAttribute('id') === 'csk-blur-actions') {
        return;
      }
      if (!e.target) {
        return;
      }
      setSelected();
      resetBlur();
    }, 300);

    const handleActionsMouseleave = throttle((e) => {
      if (e.toElement && $(CSK_ENTRY_SELECTOR).is(e.toElement)) {
        return;
      }
      resetBlur();
      setSelected();
    }, 300);
    if (setSelected) {
      $('body')
        .on('mouseenter', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter)
        .on('mouseleave', CSK_ENTRY_SELECTOR, handleCskEntryMouseleave)
        .on('mouseover', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter);

      $('#csk-blur-actions').on('mouseleave', handleActionsMouseleave);
    }

    return () => {
      if (setSelected) {
        $('body')
          .off('mouseenter', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter)
          .off('mouseleave', CSK_ENTRY_SELECTOR, handleCskEntryMouseleave)
          .off('mouseover', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter);

        $('#csk-blur-actions').on('mouseleave', handleActionsMouseleave);
      }
    };
  }, [setSelected, selectedPath]);

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

export default ElementHighlighter;
