import React from 'react';
import ReactDOM from 'react-dom';
import { map } from 'lodash';
import getIsSideKickEnabledFromStorage from './helpers/getIsSideKickEnabledFromStorage';
import hasContentfulVars from './helpers/hasContentfulVars';
import Sidebar from './components/Sidebar';
import addSidekickEnabledListener from './helpers/addSidekickEnabledListener';
import buildCskEntryTree from './helpers/buildCskEntryTree';
import { CSK_ENTRY_ID_NAME, CSK_ENTRY_SELECTOR } from './helpers/constants';
import { resetBlur, setBlur } from './helpers/blur';
import getContentfulItemUrl from './helpers/getContentfulItemUrl';

const loadSidebar = () => {
  $('body').prepend('<div id="csk-sidebar-container"></div>');

  ReactDOM.render(<Sidebar tree={buildCskEntryTree()} />, document.getElementById('csk-sidebar-container'));
};

const removeSidebar = () => {
  $('#csk-sidebar-container').remove();
};

const addInitAttribute = () => {
  $('body').attr('data-init-csk', true);
};

const removeInitAttribute = () => {
  $('body').removeAttr('data-init-csk');
};

const applyBgColorVar = () => {
  $(CSK_ENTRY_SELECTOR).each((_index, el) => {
    let inheritedBgColor;

    $(el)
      .filter(() => {
        const bgImageUrl = $(el).css('background-image');
        const bgColor = $(el).css('background-color');
        if (
          bgImageUrl !== 'none' ||
          bgColor.indexOf('rgba') === -1 ||
          bgColor.replace(/^.*,(.+)\)/, '$1').trim() !== '0'
        ) {
          $(el).attr('data-csk-init-bg', true);
          return false;
        }

        return true;
      })
      .parents()
      .each((i, v) => {
        const $el = $(v);
        const bgImageUrl = $el.css('background-image');
        if (bgImageUrl !== 'none') {
          inheritedBgColor = false;
          return false;
        }

        const bgColor = $el.css('background-color');

        if (bgColor.indexOf('rgba') > -1) {
          if (bgColor.replace(/^.*,(.+)\)/, '$1').trim() !== '0') {
            inheritedBgColor = bgColor;
            return false;
          }
        } else {
          inheritedBgColor = bgColor;
          return false;
        }
        return true;
      })
      .end()
      .attr('style', () => {
        const curStyleAttr = $(el).attr('style') || '';
        const curBgColor = inheritedBgColor || 'inherit';
        if (curStyleAttr.indexOf('--bgColor') === -1) {
          return `${curStyleAttr} --bgColor:${curBgColor};`;
        }
        return curStyleAttr;
      });
  });
};

const removeBgColorVar = () => {
  $(CSK_ENTRY_SELECTOR).css('--bgColor', '');
};

const handleCskEntryMouseenter = (e) => {
  if (!e.currentTarget) return;
  const $ct = $(e.currentTarget);
  const id = $ct.data(CSK_ENTRY_ID_NAME);
  const url = id ? getContentfulItemUrl(id) : null;
  setBlur($(e.target), url);
};

const handleCskEntryMouseleave = (e) => {
  console.log('handleCskEntryMouseleave');
  if (e.toElement && e.toElement.getAttribute('id') === 'csk-blur-actions') {
    console.log('to element actions');
    return;
  }
  if (!e.currentTarget) {
    console.log('no current target');
    return;
  }
  resetBlur();
};

const handleActionsMouseleave = (e) => {
  console.log('handleActionsMouseleave');
  if (e.toElement && $(CSK_ENTRY_SELECTOR).is(e.toElement)) {
    return;
  }

  resetBlur();
};

const addBlurCode = () => {
  $('body').append(
    ...map(['top', 'bottom', 'left', 'right'], (dir) =>
      $('<div>', { id: `csk-blur-${dir}`, class: `csk-blur csk-blur-${dir}` })
    )
  );
  $('body')
    .on('mouseenter', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter)
    .on('mouseleave', CSK_ENTRY_SELECTOR, handleCskEntryMouseleave)
    .append($('<a>', { id: 'csk-blur-actions', href: '#', target: '_blank' }).text('Edit'));

  $('#csk-blur-actions').on('mouseleave', handleActionsMouseleave);
};

const removeBlurCode = () => {
  $('.csk-blur').remove();
  $('body')
    .off('mouseenter', CSK_ENTRY_SELECTOR, handleCskEntryMouseenter)
    .off('mouseleave', CSK_ENTRY_SELECTOR, handleCskEntryMouseleave);
};

const resetDom = () => {
  removeInitAttribute();
  removeSidebar();
  removeBlurCode();
  removeBgColorVar();
};

const loadSidekick = async () => {
  addInitAttribute();
  loadSidebar();
  addBlurCode();
  applyBgColorVar();
};

const init = async () => {
  if (!hasContentfulVars()) return; // not an enabled page

  const sideKickEnabled = await getIsSideKickEnabledFromStorage(); // extension not enabled

  if (sideKickEnabled) {
    loadSidekick();
  } else {
    resetDom();
  }

  addSidekickEnabledListener((isEnabled) => {
    if (isEnabled) {
      loadSidekick();
    } else {
      resetDom();
    }
  });

  chrome.runtime.onMessage.addListener((request) => {
    const { changedUrl } = request;
    getIsSideKickEnabledFromStorage().then((enabled) => {
      if (changedUrl && enabled) {
        resetDom();
        loadSidekick();
      }
    });
  });
};

$(() => {
  setTimeout(init, 2000);
});
